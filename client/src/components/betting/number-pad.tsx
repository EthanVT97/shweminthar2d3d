import { Button } from "@/components/ui/button";
import { RotateCcw, Shuffle } from "lucide-react";

interface NumberPadProps {
  selectedNumbers: string;
  betType: "2D" | "3D";
  onNumberSelect: (number: string) => void;
  onClear: () => void;
  onRandom: () => void;
}

export default function NumberPad({
  selectedNumbers,
  betType,
  onNumberSelect,
  onClear,
  onRandom,
}: NumberPadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"];

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-gray-900 bg-white px-6 py-3 rounded-lg border-2 border-dashed border-gray-300 inline-block min-w-24">
          {selectedNumbers || "--"}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {numbers.map((num, index) => {
          if (num === "*") {
            return (
              <Button
                key={index}
                onClick={onClear}
                variant="destructive"
                className="text-xl font-semibold py-3"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            );
          }
          
          if (num === "#") {
            return (
              <Button
                key={index}
                onClick={onRandom}
                className="text-xl font-semibold py-3 bg-green-600 hover:bg-green-700"
              >
                <Shuffle className="h-5 w-5" />
              </Button>
            );
          }
          
          return (
            <Button
              key={index}
              onClick={() => onNumberSelect(num.toString())}
              variant="outline"
              className="text-xl font-semibold py-3 bg-white hover:bg-gray-100"
              disabled={selectedNumbers.length >= (betType === "2D" ? 2 : 3)}
            >
              {num}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
