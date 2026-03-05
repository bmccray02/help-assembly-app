import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// OpenAI = Primary Cognitive Layer
// This is the authority layer for all AVA decisions

const AVA_SYSTEM_PROMPT = `You are AVA (Advanced Virtual Agent), the primary cognitive layer for Help Assembly's operational intelligence system.

## Your Role
- You are the FINAL AUTHORITY for all decisions
- Gemini provides context and recommendations, but YOU decide
- You enforce the Codex rules without exception

## Your Capabilities
- Multi-step reasoning for operational decisions
- Strategic planning and risk assessment
- Brand tone governance
- Pricing integrity enforcement
- Cross-system orchestration

## Your Constraints (NEVER VIOLATE)
- Never modify pricing constants without explicit human override
- Never deploy campaigns without approval gates
- Never auto-publish SEO content without review
- Never access customer data beyond operational necessity
- Never hallucinate pricing or operational details

## Decision Framework
1. RECEIVE: Input from Gemini or direct user request
2. VALIDATE: Check against Codex rules
3. REASON: Apply multi-step logic
4. DECIDE: Approve, reject, or escalate
5. LOG: Record decision with rationale

## Response Format
Always respond with:
- decision: approved | rejected | escalated | advisory
- confidence: 0.0-1.0
- rationale: brief explanation
- next_action: what happens next
- requires_human: boolean`;

export async function POST(request: NextRequest) {
  try {
    const zai = await ZAI.create();
    
    const body = await request.json();
    const { 
      action, 
      context, 
      geminiInput, 
      urgency = 'normal',
      requestApproval = false 
    } = body;
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action type required' },
        { status: 400 }
      );
    }

    // Build the reasoning prompt
    const prompt = buildReasoningPrompt(action, context, geminiInput, urgency);
    
    // Call OpenAI for primary reasoning
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: AVA_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more deterministic decisions
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Parse the structured response
    const decision = parseDecision(response);
    
    // Log the decision (in production, this would go to a database)
    console.log('[AVA DECISION]', {
      action,
      decision: decision.decision,
      confidence: decision.confidence,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      source: 'openai_primary',
      ...decision,
      raw_response: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('AVA Decision Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Decision processing failed',
        decision: 'escalated',
        requires_human: true
      },
      { status: 500 }
    );
  }
}

function buildReasoningPrompt(
  action: string, 
  context: any, 
  geminiInput: any, 
  urgency: string
): string {
  let prompt = `## Decision Request\n`;
  prompt += `Action Type: ${action}\n`;
  prompt += `Urgency: ${urgency}\n\n`;
  
  if (context) {
    prompt += `## Context\n`;
    prompt += `\`\`\`json\n${JSON.stringify(context, null, 2)}\n\`\`\`\n\n`;
  }
  
  if (geminiInput) {
    prompt += `## Gemini Analysis (Advisory)\n`;
    prompt += `${JSON.stringify(geminiInput, null, 2)}\n\n`;
    prompt += `Remember: Gemini informs, but YOU decide.\n\n`;
  }
  
  prompt += `## Required Decision\n`;
  prompt += `Provide your decision with the structured format: decision, confidence, rationale, next_action, requires_human.`;
  
  return prompt;
}

function parseDecision(response: string) {
  // Extract structured information from the response
  const decisionMatch = response.match(/decision:\s*(approved|rejected|escalated|advisory)/i);
  const confidenceMatch = response.match(/confidence:\s*([\d.]+)/i);
  const requiresHumanMatch = response.match(/requires_human:\s*(true|false)/i);
  
  return {
    decision: decisionMatch ? decisionMatch[1].toLowerCase() : 'advisory',
    confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.7,
    requires_human: requiresHumanMatch ? requiresHumanMatch[1] === 'true' : true,
    rationale: extractSection(response, 'rationale'),
    next_action: extractSection(response, 'next_action')
  };
}

function extractSection(text: string, section: string): string {
  const regex = new RegExp(`${section}:\\s*([^\\n]+)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

export async function GET() {
  return NextResponse.json({
    status: 'AVA Primary Cognitive Layer Active',
    role: 'openai_primary',
    authority: 'final_decision',
    description: 'OpenAI serves as the primary reasoning engine for AVA'
  });
}
