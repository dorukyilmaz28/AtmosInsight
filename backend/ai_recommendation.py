#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fast AI Recommendation Service using rule-based system
Optimized for speed and performance
"""

import sys
import json

def generate_recommendation(weather_data, nasa_data, comfort_index, location, date, event_type="outdoor activity"):
    """Generate fast AI recommendation using rule-based system"""
    
    try:
        # Extract weather data
        temp_max = weather_data['daily']['temperature_2m_max'][0]
        temp_min = weather_data['daily']['temperature_2m_min'][0]
        wind = weather_data['daily']['windspeed_10m_max'][0]
        humidity = weather_data['daily']['relative_humidity_2m_max'][0]
        precipitation = weather_data['daily']['precipitation_sum'][0]
        uv_index = weather_data['daily'].get('uv_index_max', [0])[0]
        
        # Determine activity suitability
        suitability = "Mükemmel"
        suitability_emoji = "✅"
        
        if precipitation > 10:
            suitability = "Uygun değil"
            suitability_emoji = "❌"
        elif precipitation > 5:
            suitability = "Dikkatli ol"
            suitability_emoji = "⚠️"
        elif wind > 30:
            suitability = "Rüzgarlı"
            suitability_emoji = "💨"
        elif temp_max > 35 or temp_min < -5:
            suitability = "Aşırı sıcak/soğuk"
            suitability_emoji = "🌡️"
        
        # Generate time-based recommendations
        time_recommendations = []
        if wind > 20:
            time_recommendations.append("Rüzgar güçlü, sabah 8-10 arası veya akşam 18:00 sonrası daha uygun")
        if temp_max > 30:
            time_recommendations.append("Sıcaklık yüksek, sabah erken veya akşam geç saatleri tercih et")
        if humidity > 80:
            time_recommendations.append("Nem yüksek, öğle saatlerinde daha rahat olabilir")
        if precipitation > 5:
            time_recommendations.append("Yağış bekleniyor, kapalı alan alternatifi düşün")
        if uv_index > 7:
            time_recommendations.append("UV indeksi yüksek, güneş kremi kullan ve gölgede kal")
        
        if not time_recommendations:
            time_recommendations.append("Hava koşulları genel olarak uygun, istediğin saatte yapabilirsin")
        
        # Generate clothing recommendations
        clothing_recommendations = []
        if temp_max < 15:
            clothing_recommendations.append("Kalın giysiler giy, mont al")
        elif temp_max > 25:
            clothing_recommendations.append("Hafif giysiler tercih et, şapka tak")
        if wind > 15:
            clothing_recommendations.append("Rüzgar korumalı giysiler giy")
        if humidity > 70:
            clothing_recommendations.append("Nefes alabilen kumaşlar tercih et")
        if precipitation > 0:
            clothing_recommendations.append("Su geçirmez giysiler veya şemsiye al")
        if uv_index > 5:
            clothing_recommendations.append("Güneş gözlüğü ve şapka tak")
        
        # Generate activity-specific recommendations
        activity_tips = []
        if "yürüyüş" in event_type.lower() or "hiking" in event_type.lower():
            activity_tips.append("Rahat yürüyüş ayakkabısı giy")
            activity_tips.append("Su ve atıştırmalık al")
        elif "piknik" in event_type.lower() or "picnic" in event_type.lower():
            activity_tips.append("Piknik örtüsü ve soğutucu al")
            activity_tips.append("Böcek kovucu sprey kullan")
        elif "düğün" in event_type.lower() or "wedding" in event_type.lower():
            activity_tips.append("Açık hava düğünü için yedek plan hazırla")
            activity_tips.append("Misafirler için gölgelik düşün")
        elif "fotoğraf" in event_type.lower() or "photography" in event_type.lower():
            activity_tips.append("Kamera ekipmanlarını koruyucu kılıf ile taşı")
            activity_tips.append("Altın saatlerde (gün doğumu/batımı) çekim yap")
        
        # Generate safety tips
        safety_tips = []
        if temp_max > 30:
            safety_tips.append("Sıcak çarpmasına dikkat et, bol su iç")
        if wind > 25:
            safety_tips.append("Rüzgar nedeniyle düşen objelere dikkat et")
        if precipitation > 5:
            safety_tips.append("Islak yüzeylerde kayma riski var")
        if uv_index > 6:
            safety_tips.append("Güneş yanığı riski yüksek, korun")
        
        # Build the recommendation
        recommendation = f"""{suitability_emoji} **Uygunluk:** {suitability}

📊 **Hava Durumu:**
• Sıcaklık: {temp_max}°C (maks) / {temp_min}°C (min)
• Rüzgar: {wind} km/h
• Nem: %{humidity}
• Yağış: {precipitation}mm
• UV İndeksi: {uv_index}

📈 **Konfor Skoru:** {comfort_index['score']}/100 ({comfort_index['level']})

⏰ **Zaman Önerileri:**
{chr(10).join(f"• {rec}" for rec in time_recommendations)}

👕 **Giyim Önerileri:**
{chr(10).join(f"• {rec}" for rec in clothing_recommendations) if clothing_recommendations else "• Mevcut hava koşullarına uygun giyin"}

🎯 **Etkinlik İpuçları:**
{chr(10).join(f"• {rec}" for rec in activity_tips) if activity_tips else "• Genel güvenlik kurallarına uy"}

⚠️ **Güvenlik Uyarıları:**
{chr(10).join(f"• {rec}" for rec in safety_tips) if safety_tips else "• Genel güvenlik önlemlerini al"}"""

        return recommendation
        
    except Exception as e:
        print(f"Error generating recommendation: {e}", file=sys.stderr)
        # Return simple fallback recommendation
        return f"Hava durumu analizi: {comfort_index.get('level', 'Orta')} seviyede rahatsızlık ({comfort_index.get('score', 50)}/100). Sıcaklık {weather_data['daily']['temperature_2m_max'][0]}°C, nem %{weather_data['daily']['relative_humidity_2m_max'][0]}."

def main():
    """Main function to handle command line input"""
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Extract data
        weather_data = input_data.get('weather_data', {})
        nasa_data = input_data.get('nasa_data')
        comfort_index = input_data.get('comfort_index', {})
        location = input_data.get('location', '')
        date = input_data.get('date', '')
        event_type = input_data.get('event_type', 'outdoor activity')
        
        # Generate recommendation
        recommendation = generate_recommendation(
            weather_data, nasa_data, comfort_index, location, date, event_type
        )
        
        # Output the result
        print(json.dumps({"recommendation": recommendation}))
        
    except Exception as e:
        print(f"Error in main: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()