// ============================================
// AVA INTELLIGENCE FLOW ENGINE
// OpenAI = Primary | Gemini = Advisory
// ============================================

import ZAI from 'z-ai-web-dev-sdk';

// Intelligence Sources
type IntelligenceSource = 'openai_primary' | 'gemini_advisory' | 'human_override';

// Decision Types
type DecisionType = 'approved' | 'rejected' | 'escalated' | 'advisory';

// Operation Modes
export type OperationMode = 'passive' | 'advisory' | 'execution';

// Task Priority
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

// ============================================
// INTELLIGENCE REQUEST INTERFACE
// ============================================
export interface IntelligenceRequest {
  type: 'geo_analysis' | 'pricing_check' | 'seo_recommendation' | 'booking_validation' | 'competitor_scan' | 'route_optimization';
  context: Record<string, any>;
  urgency: TaskPriority;
  requiresApproval: boolean;
  source: 'user' | 'scheduled' | 'trigger';
}

// ============================================
// INTELLIGENCE RESPONSE INTERFACE
// ============================================
export interface IntelligenceResponse {
  decision: DecisionType;
  confidence: number;
  rationale: string;
  nextAction: string;
  requiresHuman: boolean;
  geminiAnalysis?: GeminiAnalysis;
  openaiDecision?: OpenAIDecision;
  timestamp: string;
  executionPath: IntelligenceSource[];
}

// ============================================
// GEMINI ANALYSIS (ADVISORY LAYER)
// ============================================
export interface GeminiAnalysis {
  insights: string[];
  patterns: string[];
  recommendations: string[];
  dataPoints: Record<string, any>;
  confidence: number;
}

// ============================================
// OPENAI DECISION (AUTHORITY LAYER)
// ============================================
export interface OpenAIDecision {
  finalDecision: DecisionType;
  reasoning: string;
  constraintsChecked: string[];
  riskAssessment: 'low' | 'medium' | 'high' | 'critical';
  codexCompliance: boolean;
}

// ============================================
// INTELLIGENCE FLOW CLASS
// ============================================
export class IntelligenceFlowEngine {
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
  private executionLog: IntelligenceResponse[] = [];

  async initialize() {
    this.zai = await ZAI.create();
    return this;
  }

  // ============================================
  // MAIN INTELLIGENCE FLOW
  // ============================================
  async process(request: IntelligenceRequest): Promise<IntelligenceResponse> {
    const executionPath: IntelligenceSource[] = [];
    
    try {
      if (!this.zai) {
        await this.initialize();
      }

      // STEP 1: Gemini Advisory Analysis (Context Expansion)
      const geminiAnalysis = await this.runGeminiAnalysis(request);
      executionPath.push('gemini_advisory');

      // STEP 2: OpenAI Primary Decision (Authority Layer)
      const openaiDecision = await this.runOpenAIDecision(request, geminiAnalysis);
      executionPath.push('openai_primary');

      // STEP 3: Build Response
      const response: IntelligenceResponse = {
        decision: openaiDecision.finalDecision,
        confidence: openaiDecision.codexCompliance ? 0.9 : 0.6,
        rationale: openaiDecision.reasoning,
        nextAction: this.determineNextAction(openaiDecision.finalDecision, request.type),
        requiresHuman: openaiDecision.finalDecision === 'escalated' || request.requiresApproval,
        geminiAnalysis,
        openaiDecision,
        timestamp: new Date().toISOString(),
        executionPath
      };

      // Log the execution
      this.executionLog.push(response);
      
      return response;

    } catch (error: any) {
      // Escalate on failure
      return {
        decision: 'escalated',
        confidence: 0,
        rationale: `Intelligence flow error: ${error.message}`,
        nextAction: 'human_review_required',
        requiresHuman: true,
        timestamp: new Date().toISOString(),
        executionPath: [...executionPath, 'human_override']
      };
    }
  }

  // ============================================
  // GEMINI ADVISORY LAYER
  // Context Expansion & Pattern Recognition
  // ============================================
  private async runGeminiAnalysis(request: IntelligenceRequest): Promise<GeminiAnalysis> {
    const prompt = this.buildGeminiPrompt(request);
    
    const completion = await this.zai!.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: `You are Gemini, the strategic augmentation layer for AVA.
Your role is ADVISORY ONLY. You inform, you do not decide.
Analyze data, identify patterns, and provide structured recommendations.
Never make final decisions - that is OpenAI's role.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 400
    });

    const response = completion.choices[0]?.message?.content || '';
    
    return this.parseGeminiResponse(response);
  }

  private buildGeminiPrompt(request: IntelligenceRequest): string {
    return `## Advisory Analysis Request
Type: ${request.type}
Urgency: ${request.urgency}

## Context
${JSON.stringify(request.context, null, 2)}

## Required Analysis
Provide:
1. insights: Key observations from the data
2. patterns: Recognized patterns or trends
3. recommendations: Suggested actions (advisory only)
4. dataPoints: Relevant metrics extracted
5. confidence: Your confidence in this analysis (0.0-1.0)

Remember: You advise. OpenAI decides.`;
  }

  private parseGeminiResponse(response: string): GeminiAnalysis {
    return {
      insights: this.extractList(response, 'insights'),
      patterns: this.extractList(response, 'patterns'),
      recommendations: this.extractList(response, 'recommendations'),
      dataPoints: this.extractJson(response) || {},
      confidence: this.extractConfidence(response)
    };
  }

  // ============================================
  // OPENAI AUTHORITY LAYER
  // Final Decision & Enforcement
  // ============================================
  private async runOpenAIDecision(
    request: IntelligenceRequest, 
    geminiAnalysis: GeminiAnalysis
  ): Promise<OpenAIDecision> {
    const prompt = this.buildOpenAIPrompt(request, geminiAnalysis);
    
    const completion = await this.zai!.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: `You are AVA's Primary Cognitive Layer powered by OpenAI.
You are the FINAL AUTHORITY. Gemini advises, but YOU decide.

## Codex Constraints (NEVER VIOLATE)
- Pricing: Never modify constants without human override
- Deployment: Never deploy campaigns without approval gates
- Content: Never auto-publish SEO without review
- Privacy: Never access data beyond operational need

## Decision Types
- approved: Safe to execute
- rejected: Violates constraints
- escalated: Requires human judgment
- advisory: Information only (no action)

## Required Response Format
- finalDecision: [approved/rejected/escalated/advisory]
- reasoning: Brief explanation
- constraintsChecked: List of rules evaluated
- riskAssessment: [low/medium/high/critical]
- codexCompliance: [true/false]`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 300
    });

    const response = completion.choices[0]?.message?.content || '';
    
    return this.parseOpenAIResponse(response);
  }

  private buildOpenAIPrompt(
    request: IntelligenceRequest, 
    geminiAnalysis: GeminiAnalysis
  ): string {
    return `## Decision Request
Type: ${request.type}
Urgency: ${request.urgency}
Requires Approval: ${request.requiresApproval}

## Context
${JSON.stringify(request.context, null, 2)}

## Gemini Advisory Analysis
Insights: ${geminiAnalysis.insights.join(', ')}
Patterns: ${geminiAnalysis.patterns.join(', ')}
Recommendations: ${geminiAnalysis.recommendations.join(', ')}
Gemini Confidence: ${geminiAnalysis.confidence}

## Your Task
Evaluate against Codex constraints and provide your FINAL DECISION.
Remember: Gemini advises. YOU decide.`;
  }

  private parseOpenAIResponse(response: string): OpenAIDecision {
    const decisionMatch = response.match(/finalDecision:\s*(approved|rejected|escalated|advisory)/i);
    const riskMatch = response.match(/riskAssessment:\s*(low|medium|high|critical)/i);
    const complianceMatch = response.match(/codexCompliance:\s*(true|false)/i);
    
    return {
      finalDecision: (decisionMatch ? decisionMatch[1].toLowerCase() : 'escalated') as DecisionType,
      reasoning: this.extractSection(response, 'reasoning'),
      constraintsChecked: this.extractList(response, 'constraintsChecked'),
      riskAssessment: (riskMatch ? riskMatch[1].toLowerCase() : 'medium') as 'low' | 'medium' | 'high' | 'critical',
      codexCompliance: complianceMatch ? complianceMatch[1] === 'true' : false
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  private determineNextAction(decision: DecisionType, type: string): string {
    const actionMap: Record<DecisionType, string> = {
      approved: `execute_${type}`,
      rejected: 'log_and_notify',
      escalated: 'human_review_queue',
      advisory: 'store_for_reference'
    };
    return actionMap[decision];
  }

  private extractList(text: string, section: string): string[] {
    const regex = new RegExp(`${section}:\\s*\\[?([^\\]\\n]+)\\]?`, 'i');
    const match = text.match(regex);
    if (!match) return [];
    return match[1].split(',').map(s => s.trim()).filter(Boolean);
  }

  private extractJson(text: string): Record<string, any> | null {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        return null;
      }
    }
    return null;
  }

  private extractConfidence(text: string): number {
    const match = text.match(/confidence:\s*([\d.]+)/i);
    return match ? parseFloat(match[1]) : 0.7;
  }

  private extractSection(text: string, section: string): string {
    const regex = new RegExp(`${section}:\\s*([^\\n]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  // Get execution log for auditing
  getExecutionLog(): IntelligenceResponse[] {
    return this.executionLog;
  }

  // Clear log
  clearLog(): void {
    this.executionLog = [];
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================
let engineInstance: IntelligenceFlowEngine | null = null;

export async function getIntelligenceEngine(): Promise<IntelligenceFlowEngine> {
  if (!engineInstance) {
    engineInstance = new IntelligenceFlowEngine();
    await engineInstance.initialize();
  }
  return engineInstance;
}
