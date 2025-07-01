import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertBetSchema, insertResultSchema, insertTransactionSchema } from "@shared/schema";
import { authenticateToken, requireAdmin, generateToken, type AuthRequest } from "./middleware/auth";
import jwt from "jsonwebtoken";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { confirmPassword, ...userData } = validatedData;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      const token = generateToken(user.id);
      
      res.status(201).json({
        message: "User created successfully",
        token,
        user: { id: user.id, username: user.username, balance: user.balance, referralCode: user.referralCode }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.validateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = generateToken(user.id);
      
      res.json({
        message: "Login successful",
        token,
        user: { 
          id: user.id, 
          username: user.username, 
          balance: user.balance, 
          referralCode: user.referralCode,
          isAdmin: user.isAdmin 
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        balance: req.user.balance,
        referralCode: req.user.referralCode,
        commission: req.user.commission,
        isAdmin: req.user.isAdmin
      }
    });
  });

  // Betting routes
  app.post("/api/bets", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const betData = insertBetSchema.parse({
        ...req.body,
        userId: req.user.id,
        drawDate: new Date()
      });
      
      // Validate bet amount against user balance
      if (parseFloat(betData.amount) > parseFloat(req.user.balance)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Validate number format
      if (betData.type === "2D" && (betData.number.length !== 2 || !/^\d{2}$/.test(betData.number))) {
        return res.status(400).json({ message: "Invalid 2D number format" });
      }
      if (betData.type === "3D" && (betData.number.length !== 3 || !/^\d{3}$/.test(betData.number))) {
        return res.status(400).json({ message: "Invalid 3D number format" });
      }
      
      // Calculate potential payout
      const odds = betData.type === "2D" ? 85 : 500;
      const potentialPayout = (parseFloat(betData.amount) * odds).toString();
      
      const bet = await storage.createBet({
        ...betData,
        potentialPayout
      });
      
      res.status(201).json({ message: "Bet placed successfully", bet });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to place bet" });
    }
  });

  app.get("/api/bets", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const bets = await storage.getBetsByUserId(req.user.id);
      res.json({ bets });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch bets" });
    }
  });

  // Results routes
  app.get("/api/results/today", async (req, res) => {
    try {
      const result = await storage.getTodayResult();
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch today's results" });
    }
  });

  // Transaction routes
  app.post("/api/transactions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json({ message: "Transaction request created", transaction });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create transaction" });
    }
  });

  app.get("/api/transactions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const transactions = await storage.getTransactionsByUserId(req.user.id);
      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Admin routes
  app.post("/api/admin/results", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const resultData = insertResultSchema.parse(req.body);
      const result = await storage.createResult(resultData);
      
      await storage.createAuditLog(
        req.user.id,
        "RESULT_CREATED",
        `Created result for ${resultData.date}: 2D=${resultData.result2d}, 3D=${resultData.result3d}`
      );
      
      res.status(201).json({ message: "Result created and bets processed", result });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create result" });
    }
  });

  app.get("/api/admin/transactions/pending", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const transactions = await storage.getPendingTransactions();
      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch pending transactions" });
    }
  });

  app.patch("/api/admin/transactions/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      await storage.updateTransactionStatus(parseInt(id), status);
      
      await storage.createAuditLog(
        req.user.id,
        "TRANSACTION_UPDATE",
        `Updated transaction ${id} status to ${status}`
      );
      
      res.json({ message: "Transaction updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/bets", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const bets = await storage.getBetsByDate(date);
      res.json({ bets });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch bets" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
