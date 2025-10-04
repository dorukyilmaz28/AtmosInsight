import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
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

Respond in JSON format:
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
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional weather advisor specializing in outdoor event planning. Provide accurate, practical, and safety-focused recommendations based on weather data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    const aiResponse = JSON.parse(response);
    
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
