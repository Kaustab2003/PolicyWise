"use client";

import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type VoiceInputProps = {
  isListening: boolean;
  onToggle: () => void;
};

export function VoiceInput({ isListening, onToggle }: VoiceInputProps) {
  const tooltipText = isListening ? "Stop listening" : "Start listening";
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onToggle}
          className={isListening ? "text-red-500 border-red-500" : ""}
          aria-label={tooltipText}
        >
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          <span className="sr-only">
            {tooltipText}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}
