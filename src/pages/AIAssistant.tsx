import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Mic, MicOff, Plus, MessageSquare } from "lucide-react";
import { useAIChat } from "@/hooks/useAIChat";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const SUGGESTED_QUESTIONS = [
  "What did I spend most on this month?",
  "How can I save more money?",
  "Am I on track with my savings goals?",
  "What's my average monthly expense?",
  "Should I pay off my loans faster?",
];

const AIAssistant = () => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    sendMessage,
    loadConversation,
    startNewConversation,
  } = useAIChat();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="container py-8 h-[calc(100vh-8rem)]">
      <div className="flex gap-6 h-full">
        {/* Sidebar - Conversations */}
        <Card className="w-64 flex flex-col">
          <div className="p-4 border-b">
            <Button
              onClick={startNewConversation}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((conv) => (
                <Button
                  key={conv.id}
                  variant={currentConversationId === conv.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => loadConversation(conv.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {conv.title || "New Conversation"}
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Financial Assistant
            </h1>
            <p className="text-muted-foreground">Ask me anything about your finances</p>
          </div>

          <Card className="flex-1 flex flex-col">
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Sparkles className="h-16 w-16 text-muted-foreground" />
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Start a conversation</h3>
                    <p className="text-muted-foreground">
                      Ask me about your spending, savings, or get financial advice
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                    {SUGGESTED_QUESTIONS.map((question, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        {question}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2 max-w-[80%]",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium">You</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-5 w-5 text-primary-foreground animate-pulse" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce" />
                          <div className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <CardContent className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything about your finances..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                {recognitionRef.current && (
                  <Button
                    size="icon"
                    variant={isListening ? "destructive" : "outline"}
                    onClick={toggleVoiceInput}
                    disabled={isLoading}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
