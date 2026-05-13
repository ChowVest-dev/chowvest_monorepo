import { NextRequest, NextResponse } from "next/server";

const CHOWVEST_SYSTEM_PROMPT = `You are Chowvest Assistant, a helpful AI guide embedded inside the Chowvest app onboarding tour.

Chowvest is a Nigerian agri-fintech platform that lets users:
1. **Wallet**: Fund a digital wallet via card or bank transfer (Paystack). The wallet is the central hub for all spending.
2. **Basket Goals (Chow Targets)**: Save towards specific food commodities (Rice, Beans, Garri, etc.). Users pick a commodity, set a target date, and top up over time. When they hit 100%, they can request physical delivery.
3. **Market**: Browse and buy food commodities directly from wallet balance. Items include Premium Rice, Brown Beans, Maize Seeds, White Garri, Yam Tubers, and Cassava Stems.
4. **Deposits**: Powered by Paystack — supports card and bank transfer payment methods.
5. **Delivery**: When a basket goal reaches 100%, users request delivery and receive an update from the Chowvest team.

Answer questions about how these features work, how to use them, or what they mean. Be concise (2-4 sentences). Keep a warm, encouraging Nigerian fintech brand tone.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        content:
          "AI assistant is not configured yet. Please set GEMINI_API_KEY in your environment to enable this feature.",
      },
      { status: 200 }
    );
  }

  try {
    const { messages, currentStepId } = await req.json();

    const stepContext = currentStepId
      ? `\nThe user is currently looking at: "${currentStepId}" in the onboarding tour.`
      : "";

    // Build Gemini contents array from conversation history
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: CHOWVEST_SYSTEM_PROMPT + stepContext }],
          },
          contents,
          generationConfig: { maxOutputTokens: 256 },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I couldn't respond.";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Onboarding chat error:", error);
    return NextResponse.json(
      { content: "Couldn't reach the AI right now. Please try again." },
      { status: 200 }
    );
  }
}
