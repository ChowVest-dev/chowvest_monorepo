"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@chowvest/ui";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@chowvest/ui";
import { Badge } from "@chowvest/ui";
import { ChevronLeft, ChevronRight, X, Sparkles, Send } from "lucide-react";
import axios from "axios";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TooltipCardProps {
  stepIndex: number;
  totalSteps: number;
  stepId: string;
  headline: string;
  description: string;
  position: { top: number; left: number };
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function TooltipCard({
  stepIndex,
  totalSteps,
  stepId,
  headline,
  description,
  position,
  onNext,
  onPrev,
  onSkip,
  isFirst,
  isLast,
}: TooltipCardProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const { data } = await axios.post("/api/onboarding/chat", {
        messages: nextMessages,
        currentStepId: stepId,
      });
      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "Couldn't reach the AI right now. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card
      className="fixed z-[10000] w-80 shadow-2xl border-primary/20 bg-card"
      style={{
        top: position.top,
        left: position.left,
        maxHeight: chatOpen ? 480 : "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <CardHeader className="pb-2 gap-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs font-medium text-primary border-primary/30">
            Step {stepIndex + 1} of {totalSteps}
          </Badge>
          <button
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Skip tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <CardTitle className="text-base leading-snug">{headline}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>

      {/* AI Chat Panel */}
      <CardContent className="pb-2">
        <button
          onClick={() => setChatOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {chatOpen ? "Hide" : "Ask Chowvest AI"}
        </button>

        {chatOpen && (
          <div className="mt-3 space-y-2">
            {/* Message history */}
            <div
              ref={scrollRef}
              className="h-32 overflow-y-auto space-y-2 pr-1"
            >
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  Ask anything about this feature…
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-xs rounded-lg px-3 py-2 leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground ml-6"
                      : "bg-muted text-foreground mr-6"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {isSending && (
                <div className="bg-muted text-foreground text-xs rounded-lg px-3 py-2 mr-6 animate-pulse">
                  Thinking…
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a question…"
                disabled={isSending}
                className="flex-1 text-xs bg-input border border-border rounded-md px-2.5 py-1.5 placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
              />
              <Button
                size="icon-sm"
                onClick={handleSend}
                disabled={isSending || !input.trim()}
                className="shrink-0"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer: progress dots + navigation */}
      <CardFooter className="flex flex-col gap-3 pt-0">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 self-center">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === stepIndex
                  ? "w-4 h-2 bg-primary"
                  : i < stepIndex
                  ? "w-2 h-2 bg-primary/50"
                  : "w-2 h-2 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={isFirst}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>

          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
          >
            Skip tour
          </button>

          <Button size="sm" onClick={onNext} className="gap-1">
            {isLast ? "Finish" : "Next"}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
