import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;

  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);

    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }

    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();

    if (!audio) {
      throw new Error("No audio data provided");
    }

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Step 1: Transcribe audio using Whisper
    const binaryAudio = processBase64Chunks(audio);
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: "audio/webm" });
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-1");
    formData.append("language", "en");

    const transcriptionResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAIApiKey}`,
        },
        body: formData,
      }
    );

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription failed: ${await transcriptionResponse.text()}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    const transcribedText = transcriptionResult.text;

    console.log("Transcribed text:", transcribedText);

    // Step 2: Parse the expense using GPT
    const parseResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expense parser. Extract expense information from natural language.
              
              Return a JSON object with these fields:
              - amount: number (the expense amount, extract from text like "50 rupees", "hundred", "500", etc.)
              - category: string (one of: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Other)
              - description: string (a brief description of the expense)
              
              Examples:
              "I spent 50 rupees on coffee" -> {"amount": 50, "category": "Food & Dining", "description": "Coffee"}
              "Paid 500 for taxi" -> {"amount": 500, "category": "Transportation", "description": "Taxi fare"}
              "Bought groceries for 200" -> {"amount": 200, "category": "Shopping", "description": "Groceries"}
              
              If you cannot extract a valid expense, return null.`,
          },
          {
            role: "user",
            content: transcribedText,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!parseResponse.ok) {
      throw new Error(`Parsing failed: ${await parseResponse.text()}`);
    }

    const parseResult = await parseResponse.json();
    const parsedContent = JSON.parse(parseResult.choices[0].message.content);

    console.log("Parsed expense:", parsedContent);

    // Validate the parsed result
    if (!parsedContent || !parsedContent.amount || parsedContent.amount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          transcription: transcribedText,
          expense: null,
          error: "Could not extract expense information",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        transcription: transcribedText,
        expense: {
          amount: parsedContent.amount,
          category: parsedContent.category || "Other",
          description: parsedContent.description || transcribedText,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing voice expense:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
