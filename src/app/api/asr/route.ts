import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const zai = await ZAI.create();
    
    // Get the audio data from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    
    // Use ASR (Automatic Speech Recognition) from z-ai-web-dev-sdk
    // The SDK provides speech-to-text capabilities
    const result = await zai.asr.transcribe({
      audio: base64Audio,
      format: audioFile.type.includes('webm') ? 'webm' : 'wav',
      language: 'en'
    });

    return NextResponse.json({
      success: true,
      transcript: result.text || result.transcript || '',
      confidence: result.confidence || 0.9
    });
    
  } catch (error: any) {
    console.error('ASR Error:', error);
    
    // Fallback: Try using the chat completion as a fallback
    // This handles cases where ASR might not be directly available
    try {
      const zai = await ZAI.create();
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File;
      
      if (!audioFile) {
        return NextResponse.json(
          { error: 'No audio file provided' },
          { status: 400 }
        );
      }

      // Return a placeholder - client will use Web Speech API as fallback
      return NextResponse.json({
        success: false,
        error: 'ASR service unavailable, using fallback',
        useFallback: true
      });
    } catch (fallbackError: any) {
      return NextResponse.json(
        { error: fallbackError.message || 'ASR processing failed' },
        { status: 500 }
      );
    }
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ASR API endpoint ready',
    description: 'POST audio file to /api/asr for speech-to-text transcription'
  });
}
