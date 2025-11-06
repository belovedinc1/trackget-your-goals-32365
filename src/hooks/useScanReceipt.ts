import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScanReceiptResult {
  amount: number;
  date: string;
  merchant: string;
  category: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
}

const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const useScanReceipt = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (imageFile: File): Promise<ScanReceiptResult> => {
      // Convert image to base64
      const imageBase64 = await convertImageToBase64(imageFile);

      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: { imageBase64 }
      });

      if (error) {
        console.error('Error scanning receipt:', error);
        throw new Error('Failed to scan receipt');
      }

      if (!data) {
        throw new Error('No data returned from scan');
      }

      return data as ScanReceiptResult;
    },
    onError: (error: Error) => {
      console.error('Receipt scan error:', error);
      toast({
        title: "Scan failed",
        description: error.message || "Could not analyze receipt. Please try again.",
        variant: "destructive",
      });
    },
  });
};
