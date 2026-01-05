import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateExpense } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoiceExpenseInputProps {
  onExpenseAdded?: () => void;
}

export function VoiceExpenseInput({ onExpenseAdded }: VoiceExpenseInputProps) {
  const { user } = useAuth();
  const createExpense = useCreateExpense();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await processAudio();
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Listening... Speak your expense", { duration: 2000 });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      // Call edge function to transcribe and parse
      const { data, error } = await supabase.functions.invoke("voice-expense", {
        body: { audio: base64Audio },
      });

      if (error) throw error;

      if (data.expense) {
        await createExpense.mutateAsync({
          amount: data.expense.amount,
          category: data.expense.category,
          description: data.expense.description,
          expense_date: new Date().toISOString().split('T')[0],
          type: "expense",
          receipt_url: null,
          account_id: null,
        });

        toast.success(
          `Added: ${data.expense.description} - ₹${data.expense.amount}`,
          { description: `Category: ${data.expense.category}` }
        );
        onExpenseAdded?.();
      } else {
        toast.error("Could not understand the expense. Please try again.");
      }
    } catch (error) {
      console.error("Error processing voice:", error);
      toast.error("Failed to process voice input");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      variant={isRecording ? "destructive" : "outline"}
      size="lg"
      className={cn(
        "h-16 w-16 rounded-full transition-all duration-300",
        isRecording && "animate-pulse",
        isProcessing && "opacity-50"
      )}
      onClick={handleClick}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-6 w-6" />
      ) : (
        <Mic className="h-6 w-6" />
      )}
    </Button>
  );
}
