import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const zai = await ZAI.create();
    
    const body = await request.json();
    const { text, voice = 'default', speed = 1.0 } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Use TTS from z-ai-web-dev-sdk
    const result = await zai.tts.synthesize({
      text: text,
      voice: voice,
      speed: speed,
      format: 'mp3'
    });

    // The result should contain audio data
    if (result.audio || result.data) {
      const audioBase64 = result.audio || result.data;
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString(),
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    // If no audio in result, return error
    return NextResponse.json(
      { error: 'TTS synthesis failed - no audio generated' },
      { status: 500 }
    );
    
  } catch (error: any) {
    console.error('TTS Error:', error);
    
    // Return a flag to use browser TTS as fallback
    return NextResponse.json({
      success: false,
      error: error.message || 'TTS processing failed',
      useFallback: true
    });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'TTS API endpoint ready',
    description: 'POST text to /api/tts for text-to-speech synthesis',
    parameters: {
      text: 'string - The text to synthesize',
      voice: 'string (optional) - Voice ID',
      speed: 'number (optional) - Speech speed (0.5-2.0)'
    }
  });
}
