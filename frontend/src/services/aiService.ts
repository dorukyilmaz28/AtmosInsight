// Using fetch API instead of OpenAI SDK to avoid module resolution issues

export interface WeatherAnalysisRequest {
  location: string;
  date: string;
  eventType: string;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  humidity: number;
  uvIndex: number;
  weatherDescription: string;
}

export interface AIRecommendation {
  recommendation: string;
  confidence: number;
  risks: Array<{
    type: string;
    probability: number;
    description: string;
  }>;
  tips: string[];
  alternatives: string[];
}

export async function getAIWeatherAnalysis(request: WeatherAnalysisRequest): Promise<AIRecommendation> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const prompt = `
You are an expert weather advisor for outdoor events. Analyze the following weather data and provide a comprehensive recommendation.

Location: ${request.location}
Event Type: ${request.eventType}
Date: ${request.date}
Weather Conditions:
- Temperature: ${request.temperature}°C
- Wind Speed: ${request.windSpeed} km/h
- Precipitation: ${request.precipitation} mm
- Humidity: ${request.humidity}%
- UV Index: ${request.uvIndex}
- Weather Description: ${request.weatherDescription}

Please provide:
1. A clear GO/NO-GO recommendation with reasoning
2. Confidence level (0-100)
3. Risk assessment with specific probabilities
4. Practical tips for the event
5. Alternative suggestions if weather is challenging

Respond ONLY in valid JSON format (no markdown, no code blocks):
{
  "recommendation": "string",
  "confidence": number,
  "risks": [
    {
      "type": "string",
      "probability": number,
      "description": "string"
    }
  ],
  "tips": ["string"],
  "alternatives": ["string"]
}
`;

  try {
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
            "content": "You are a professional weather advisor specializing in outdoor event planning. Provide accurate, practical, and safety-focused recommendations based on weather data."
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        "temperature": 0.5,
        "max_tokens": 800
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;
    if (!aiContent) {
      throw new Error('No response from AI');
    }

    // Clean and parse JSON response
    let cleanContent = aiContent.trim();
    
    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to find JSON object in the response
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw content:', cleanContent);
      
      // Fallback response if JSON parsing fails
      aiResponse = {
        recommendation: "Weather analysis completed. Please check the conditions and plan accordingly.",
        confidence: 70,
        risks: [
          {
            type: "general",
            probability: 30,
            description: "Standard weather precautions recommended"
          }
        ],
        tips: ["Check local weather updates", "Bring appropriate clothing"],
        alternatives: ["Consider indoor alternatives if conditions worsen"]
      };
    }
    
    return {
      recommendation: aiResponse.recommendation || "Unable to provide recommendation",
      confidence: aiResponse.confidence || 50,
      risks: aiResponse.risks || [],
      tips: aiResponse.tips || [],
      alternatives: aiResponse.alternatives || []
    };

  } catch (error) {
    console.error('AI Service Error:', error);
    
    // Fallback response
    return {
      recommendation: "Weather analysis unavailable. Please check conditions manually.",
      confidence: 0,
      risks: [],
      tips: ["Check weather updates regularly", "Have backup indoor plans ready"],
      alternatives: ["Consider indoor alternatives", "Postpone if conditions worsen"]
    };
  }
}
