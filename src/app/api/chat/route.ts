import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// System prompt for AURA counselor
const SYSTEM_PROMPT = `You are AURA (Advanced User Response Agent), an empathetic AI counselor. Your role is to:

1. Provide supportive, non-judgmental responses
2. Be concise - limit responses to 1-3 short sentences unless more detail is needed
3. Show genuine empathy and understanding
4. Ask thoughtful follow-up questions when appropriate
5. Never claim to be a licensed professional
6. If someone expresses thoughts of self-harm, gently encourage them to seek professional help

Your personality:
- Warm but professional
- Wise and contemplative
- Calm and reassuring
- Direct but kind

Avoid:
- Excessive emojis
- Overly long responses
- Making medical diagnoses
- Being dismissive of concerns`;

// Crisis detection keywords
const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'end my life', 'want to die', 
  'hurt myself', 'overdose', 'jump off', 'hang myself',
  'not worth living', 'better off dead', 'no point in living'
];

const CRISIS_RESPONSE = "I'm sensing you may be in crisis. Your life has value, and there are people who want to help. Please reach out to a crisis helpline (like 988 in the US) or emergency services right now. You don't have to face this alone.";

export async function POST(request: NextRequest) {
  try {
    const zai = await ZAI.create();
    
    const body = await request.json();
    const { 
      message, 
      conversationHistory = [],
      detectCrisis = true 
    } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    // Crisis detection
    if (detectCrisis) {
      const lowerMessage = message.toLowerCase();
      for (const keyword of CRISIS_KEYWORDS) {
        if (lowerMessage.includes(keyword)) {
          return NextResponse.json({
            response: CRISIS_RESPONSE,
            isCrisis: true,
            suggestHelp: true
          });
        }
      }
    }

    // Build messages array for the LLM
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history (last 6 exchanges for context)
    const recentHistory = conversationHistory.slice(-6);
    for (const exchange of recentHistory) {
      if (exchange.user) {
        messages.push({ role: 'user', content: exchange.user });
      }
      if (exchange.ai) {
        messages.push({ role: 'assistant', content: exchange.ai });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call the LLM
    const completion = await zai.chat.completions.create({
      messages: messages,
      temperature: 0.7,
      max_tokens: 150 // Keep responses concise
    });

    const responseText = completion.choices[0]?.message?.content || 
      "I'm processing your thoughts. Please continue.";

    return NextResponse.json({
      success: true,
      response: responseText,
      isCrisis: false
    });
    
  } catch (error: any) {
    console.error('Chat Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to process message',
        response: "I'm having trouble connecting right now. Please try again."
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Chat API endpoint ready',
    description: 'POST message to /api/chat for AI responses',
    parameters: {
      message: 'string - The user message',
      conversationHistory: 'array (optional) - Previous exchanges [{user, ai}]',
      detectCrisis: 'boolean (optional) - Enable crisis detection (default: true)'
    }
  });
}
