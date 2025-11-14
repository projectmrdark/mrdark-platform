import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Loader2, Send, Bot, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Streamdown } from "streamdown";
import { getLoginUrl } from "@/const";

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { sessionId } = useParams<{ sessionId?: string }>();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  // Get or create session
  const { data: session } = trpc.agent.getSession.useQuery(
    { sessionId: Number(sessionId) },
    { enabled: !!sessionId }
  );

  const { data: messages = [] } = trpc.agent.getMessages.useQuery(
    { sessionId: Number(sessionId) },
    { enabled: !!sessionId }
  );

  const createSessionMutation = trpc.agent.createSession.useMutation({
    onSuccess: (data) => {
      setLocation(`/chat/${data.sessionId}`);
    },
  });

  const sendMessageMutation = trpc.agent.sendMessage.useMutation({
    onSuccess: () => {
      utils.agent.getMessages.invalidate({ sessionId: Number(sessionId) });
      setInput("");
      setIsStreaming(false);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    if (!sessionId) {
      // Create new session first
      createSessionMutation.mutate({
        title: input.substring(0, 50),
        model: "gpt-4",
        mode: "sandbox",
      });
      return;
    }

    setIsStreaming(true);
    sendMessageMutation.mutate({
      sessionId: Number(sessionId),
      message: input,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
          <p className="mb-4">Please sign in to use the AI Agent Platform.</p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Mr.Dark AI Agent</h1>
            {session && (
              <span className="text-sm text-muted-foreground">
                {session.title || `Session #${session.id}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setLocation("/sessions")}>
              Sessions
            </Button>
            <Button variant="outline" onClick={() => setLocation("/settings")}>
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto flex flex-col max-w-4xl py-4">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Start a conversation with Mr.Dark AI</p>
                <p className="text-sm">Type your message below to begin</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.reverse().map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <Card
                    className={`p-4 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Streamdown>{message.content}</Streamdown>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </Card>
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isStreaming && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                  <Card className="p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </Card>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isStreaming}
          >
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
