import { db } from "./db";
import { users, bets, results, transactions, auditLogs, type User, type InsertUser, type Bet, type InsertBet, type Result, type InsertResult, type Transaction, type InsertTransaction, type AuditLog } from "@shared/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User management
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  updateUserBalance(userId: number, amount: string): Promise<void>;
  generateReferralCode(): string;

  // Authentication
  validateUser(username: string, password: string): Promise<User | null>;

  // Betting
  createBet(bet: InsertBet): Promise<Bet>;
  getBetsByUserId(userId: number, limit?: number): Promise<Bet[]>;
  getBetsByDate(date: Date): Promise<Bet[]>;
  updateBetStatus(betId: number, status: string): Promise<void>;

  // Results
  createResult(result: InsertResult): Promise<Result>;
  getResultByDate(date: Date): Promise<Result | undefined>;
  getTodayResult(): Promise<Result | undefined>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getPendingTransactions(): Promise<Transaction[]>;
  updateTransactionStatus(transactionId: number, status: string): Promise<void>;

  // Admin
  createAuditLog(adminId: number, action: string, details?: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getDashboardStats(): Promise<any>;

  // Referral
  updateUserCommission(userId: number, commission: string): Promise<void>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  generateReferralCode(): string {
    return 'SM' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const referralCode = this.generateReferralCode();
    
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
      referralCode,
    }).returning();

    // If user used a referral code, update referrer's commission
    if (insertUser.usedRefCode) {
      const referrer = await this.getUserByReferralCode(insertUser.usedRefCode);
      if (referrer) {
        await this.updateUserCommission(referrer.id, (parseFloat(referrer.commission) + 50).toString());
      }
    }

    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user;
  }

  async updateUserBalance(userId: number, amount: string): Promise<void> {
    await db.update(users).set({ balance: amount }).where(eq(users.id, userId));
  }

  async updateUserCommission(userId: number, commission: string): Promise<void> {
    await db.update(users).set({ commission }).where(eq(users.id, userId));
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async createBet(bet: InsertBet): Promise<Bet> {
    const [newBet] = await db.insert(bets).values(bet).returning();
    
    // Deduct bet amount from user balance
    const user = await this.getUserById(bet.userId);
    if (user) {
      const newBalance = (parseFloat(user.balance) - parseFloat(bet.amount)).toString();
      await this.updateUserBalance(bet.userId, newBalance);
      
      // Create transaction record
      await this.createTransaction({
        userId: bet.userId,
        type: "bet",
        amount: `-${bet.amount}`,
        status: "completed",
        description: `${bet.type} bet on ${bet.number}`,
      });
    }

    return newBet;
  }

  async getBetsByUserId(userId: number, limit = 10): Promise<Bet[]> {
    return await db.select().from(bets)
      .where(eq(bets.userId, userId))
      .orderBy(desc(bets.createdAt))
      .limit(limit);
  }

  async getBetsByDate(date: Date): Promise<Bet[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.select().from(bets)
      .where(and(
        gte(bets.drawDate, startOfDay),
        lte(bets.drawDate, endOfDay)
      ))
      .orderBy(desc(bets.createdAt));
  }

  async updateBetStatus(betId: number, status: string): Promise<void> {
    await db.update(bets).set({ status }).where(eq(bets.id, betId));
  }

  async createResult(result: InsertResult): Promise<Result> {
    const [newResult] = await db.insert(results).values(result).returning();
    
    // Process all pending bets for this date
    await this.processBetsForResult(newResult);
    
    return newResult;
  }

  private async processBetsForResult(result: Result): Promise<void> {
    const dateBets = await this.getBetsByDate(result.date);
    
    for (const bet of dateBets) {
      if (bet.status !== 'pending') continue;
      
      let isWinner = false;
      const resultNumber = bet.type === '2D' ? result.result2d : result.result3d;
      
      if (resultNumber && bet.number === resultNumber) {
        isWinner = true;
        
        // Add payout to user balance
        const user = await this.getUserById(bet.userId);
        if (user) {
          const newBalance = (parseFloat(user.balance) + parseFloat(bet.potentialPayout)).toString();
          await this.updateUserBalance(bet.userId, newBalance);
          
          // Create payout transaction
          await this.createTransaction({
            userId: bet.userId,
            type: "payout",
            amount: bet.potentialPayout,
            status: "completed",
            description: `Winning payout for ${bet.type} bet on ${bet.number}`,
          });
        }
        
        await this.updateBetStatus(bet.id, 'won');
      } else {
        await this.updateBetStatus(bet.id, 'lost');
      }
    }
  }

  async getResultByDate(date: Date): Promise<Result | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [result] = await db.select().from(results)
      .where(and(
        gte(results.date, startOfDay),
        lte(results.date, endOfDay)
      ));
    return result;
  }

  async getTodayResult(): Promise<Result | undefined> {
    return await this.getResultByDate(new Date());
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.status, "pending"))
      .orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(transactionId: number, status: string): Promise<void> {
    await db.update(transactions).set({ status }).where(eq(transactions.id, transactionId));
    
    // If approved, update user balance
    if (status === 'approved') {
      const [transaction] = await db.select().from(transactions).where(eq(transactions.id, transactionId));
      if (transaction && transaction.type === 'deposit') {
        const user = await this.getUserById(transaction.userId);
        if (user) {
          const newBalance = (parseFloat(user.balance) + parseFloat(transaction.amount)).toString();
          await this.updateUserBalance(transaction.userId, newBalance);
        }
      } else if (transaction && transaction.type === 'withdrawal') {
        const user = await this.getUserById(transaction.userId);
        if (user) {
          const newBalance = (parseFloat(user.balance) - parseFloat(transaction.amount)).toString();
          await this.updateUserBalance(transaction.userId, newBalance);
        }
      }
    }
  }

  async createAuditLog(adminId: number, action: string, details?: string): Promise<void> {
    await db.insert(auditLogs).values({
      adminId,
      action,
      details,
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getDashboardStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalBetsResult] = await db.select({ count: sql<number>`count(*)` }).from(bets)
      .where(gte(bets.createdAt, today));
    
    const [totalAmountResult] = await db.select({ sum: sql<string>`sum(${bets.amount})` }).from(bets)
      .where(gte(bets.createdAt, today));
    
    const [totalWinningsResult] = await db.select({ sum: sql<string>`sum(${bets.potentialPayout})` }).from(bets)
      .where(and(gte(bets.createdAt, today), eq(bets.status, 'won')));

    return {
      totalBets: totalBetsResult.count || 0,
      totalAmount: totalAmountResult.sum || '0',
      totalWinnings: totalWinningsResult.sum || '0',
      netProfit: (parseFloat(totalAmountResult.sum || '0') - parseFloat(totalWinningsResult.sum || '0')).toString(),
    };
  }
}

export const storage = new DatabaseStorage();
