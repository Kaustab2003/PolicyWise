"use client";

import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type VoiceInputProps = {
  isListening: boolean;
  onToggle: () => void;
};

export function VoiceInput({ isListening, onToggle }: VoiceInputProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onToggle}
      className={isListening ? "text-red-500 border-red-500" : ""}
    >
      {isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isListening ? "Stop listening" : "Start listening"}
      </span>
    </Button>
  );
}
