import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export interface ChatRequest {
  message: string;
  location?: string;
  currentWeather?: {
    temperature: number;
    description: string;
    windSpeed: number;
    humidity: number;
    uvIndex: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Debug log
    console.log('Environment variables:', {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET',
      SITE_URL: process.env.SITE_URL,
      SITE_NAME: process.env.SITE_NAME
    });

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not found in environment');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    const body: ChatRequest = await request.json();
    const { message, location, currentWeather } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build context-aware prompt
    let contextPrompt = `You are AtmosInsight, a friendly AI weather assistant. Help users with weather-related questions, clothing advice, and outdoor activity recommendations.

User's question: "${message}"`;

    if (location) {
      contextPrompt += `\nUser's location: ${location}`;
    }

    if (currentWeather) {
      contextPrompt += `\nCurrent weather in ${location || 'the area'}:
- Temperature: ${currentWeather.temperature}°C
- Conditions: ${currentWeather.description}
- Wind Speed: ${currentWeather.windSpeed} km/h
- Humidity: ${currentWeather.humidity}%
- UV Index: ${currentWeather.uvIndex}`;
    }

    contextPrompt += `\n\nProvide helpful, practical advice. Be conversational and friendly. Keep responses SHORT (max 2-3 sentences). NO markdown formatting, NO tables, NO emojis. Just plain text.`;

    // Use fetch API instead of OpenAI SDK
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.SITE_URL || "https://atmos-insight.vercel.app",
        "X-Title": process.env.SITE_NAME || "AtmosInsight",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openai/gpt-oss-20b:free",
        "messages": [
          {
            "role": "system",
            "content": "You are AtmosInsight, a friendly weather assistant. Give SHORT, practical answers (max 2-3 sentences). NO markdown, NO tables, NO emojis. Just plain text responses. Focus on weather, clothing, and safety advice."
          },
          {
            "role": "user",
            "content": contextPrompt
          }
        ],
        "temperature": 0.5,
        "max_tokens": 150
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Unable to process your message. Please try again.',
        response: "I'm sorry, I'm having trouble right now. Please try asking again in a moment!"
      },
      { status: 500 }
    );
  }
}
