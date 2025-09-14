#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fast AI Recommendation Service using rule-based system
Optimized for speed and performance
"""

import sys
import json

def generate_recommendation(weather_data, nasa_data, comfort_index, location, date, event_type="outdoor activity"):
    """Generate comprehensive AI recommendation using advanced rule-based system"""
    
    try:
        # Extract weather data
        temp_max = weather_data['daily']['temperature_2m_max'][0]
        temp_min = weather_data['daily']['temperature_2m_min'][0]
        wind = weather_data['daily']['windspeed_10m_max'][0]
        humidity = weather_data['daily']['relative_humidity_2m_max'][0]
        precipitation = weather_data['daily']['precipitation_sum'][0]
        uv_index = weather_data['daily'].get('uv_index_max', [0])[0]
        visibility = weather_data['daily'].get('visibility', [10])[0]
        
        # Calculate additional metrics
        temp_avg = (temp_max + temp_min) / 2
        temp_range = temp_max - temp_min
        heat_index = temp_avg + (humidity - 50) * 0.1
        wind_chill = temp_avg - (wind * 0.7)
        
        # Determine activity suitability with detailed analysis
        suitability_score = 100
        suitability = "Mükemmel"
        suitability_emoji = "✅"
        suitability_details = []
        
        # Temperature analysis
        if temp_max > 35:
            suitability_score -= 30
            suitability = "Aşırı sıcak"
            suitability_emoji = "🔥"
            suitability_details.append("Sıcaklık tehlikeli seviyede")
        elif temp_max > 30:
            suitability_score -= 15
            suitability = "Çok sıcak"
            suitability_emoji = "☀️"
            suitability_details.append("Yüksek sıcaklık nedeniyle dikkatli ol")
        elif temp_min < -10:
            suitability_score -= 25
            suitability = "Aşırı soğuk"
            suitability_emoji = "❄️"
            suitability_details.append("Dondurucu soğuk, donma riski")
        elif temp_min < -5:
            suitability_score -= 10
            suitability = "Çok soğuk"
            suitability_emoji = "🧊"
            suitability_details.append("Soğuk hava, sıcak giyin")
        
        # Precipitation analysis
        if precipitation > 20:
            suitability_score -= 40
            suitability = "Uygun değil"
            suitability_emoji = "🌧️"
            suitability_details.append("Yoğun yağış bekleniyor")
        elif precipitation > 10:
            suitability_score -= 25
            suitability = "Riskli"
            suitability_emoji = "⛈️"
            suitability_details.append("Orta şiddette yağış")
        elif precipitation > 5:
            suitability_score -= 15
            suitability = "Dikkatli ol"
            suitability_emoji = "🌦️"
            suitability_details.append("Hafif yağış ihtimali")
        
        # Wind analysis
        if wind > 40:
            suitability_score -= 30
            if suitability == "Mükemmel":
                suitability = "Çok rüzgarlı"
                suitability_emoji = "💨"
            suitability_details.append("Güçlü rüzgar, güvenlik riski")
        elif wind > 25:
            suitability_score -= 15
            if suitability == "Mükemmel":
                suitability = "Rüzgarlı"
                suitability_emoji = "🌬️"
            suitability_details.append("Orta şiddette rüzgar")
        
        # UV Index analysis
        if uv_index > 8:
            suitability_score -= 20
            if suitability == "Mükemmel":
                suitability = "Yüksek UV"
                suitability_emoji = "☀️"
            suitability_details.append("Çok yüksek UV indeksi")
        elif uv_index > 6:
            suitability_score -= 10
            if suitability == "Mükemmel":
                suitability = "Orta UV"
                suitability_emoji = "🌞"
            suitability_details.append("Yüksek UV indeksi")
        
        # Humidity analysis
        if humidity > 90:
            suitability_score -= 15
            suitability_details.append("Çok yüksek nem, bunaltıcı")
        elif humidity > 80:
            suitability_score -= 8
            suitability_details.append("Yüksek nem")
        elif humidity < 20:
            suitability_score -= 5
            suitability_details.append("Düşük nem, cilt kuruluğu")
        
        # Visibility analysis
        if visibility < 1:
            suitability_score -= 25
            if suitability == "Mükemmel":
                suitability = "Sisli"
                suitability_emoji = "🌫️"
            suitability_details.append("Yoğun sis, görüş mesafesi çok düşük")
        elif visibility < 5:
            suitability_score -= 10
            suitability_details.append("Sisli hava, dikkatli ol")
        
        # Final suitability determination
        if suitability_score >= 90:
            suitability = "Mükemmel"
            suitability_emoji = "✅"
        elif suitability_score >= 75:
            suitability = "İyi"
            suitability_emoji = "👍"
        elif suitability_score >= 60:
            suitability = "Orta"
            suitability_emoji = "⚠️"
        elif suitability_score >= 40:
            suitability = "Kötü"
            suitability_emoji = "❌"
        else:
            suitability = "Tehlikeli"
            suitability_emoji = "🚨"
        
        # Generate comprehensive time-based recommendations
        time_recommendations = []
        optimal_times = []
        
        # Morning recommendations (6-10 AM)
        morning_score = 50
        if temp_min > 15 and temp_min < 25 and wind < 20:
            morning_score += 30
            optimal_times.append("Sabah 6-10 arası ideal")
        if temp_max > 30:
            morning_score += 20
            time_recommendations.append("Sabah erken saatler (6-9 arası) en uygun")
        if wind > 20:
            morning_score -= 15
            time_recommendations.append("Sabah rüzgar daha az olabilir")
        
        # Afternoon recommendations (10-16 PM)
        afternoon_score = 50
        if temp_max < 30 and temp_max > 20 and wind < 15:
            afternoon_score += 25
            optimal_times.append("Öğleden sonra 12-16 arası uygun")
        if temp_max > 35:
            afternoon_score -= 30
            time_recommendations.append("Öğle saatlerinden kaçın (11-15 arası)")
        if uv_index > 6:
            afternoon_score -= 20
            time_recommendations.append("Öğle saatlerinde UV yüksek, gölgede kal")
        
        # Evening recommendations (16-20 PM)
        evening_score = 50
        if temp_max > 25 and temp_min > 15 and wind < 20:
            evening_score += 25
            optimal_times.append("Akşam 16-20 arası güzel")
        if temp_max > 30:
            evening_score += 20
            time_recommendations.append("Akşam saatleri (18-20 arası) daha serin")
        if wind > 25:
            evening_score -= 10
            time_recommendations.append("Akşam rüzgar azalabilir")
        
        if not time_recommendations:
            time_recommendations.append("Hava koşulları genel olarak uygun")
        
        # Generate detailed clothing recommendations
        clothing_recommendations = []
        clothing_priority = []
        
        # Base layer recommendations
        if temp_max < 10:
            clothing_recommendations.append("Kalın mont veya kışlık ceket (0-10°C)")
            clothing_priority.append("🔥 Kalın mont")
        elif temp_max < 15:
            clothing_recommendations.append("Orta kalınlıkta mont veya hırka (10-15°C)")
            clothing_priority.append("🧥 Orta mont")
        elif temp_max < 20:
            clothing_recommendations.append("Hafif ceket veya uzun kollu (15-20°C)")
            clothing_priority.append("👔 Hafif ceket")
        elif temp_max < 25:
            clothing_recommendations.append("T-shirt veya ince gömlek (20-25°C)")
            clothing_priority.append("👕 T-shirt")
        else:
            clothing_recommendations.append("Çok hafif giysiler, terletmeyen kumaş (25°C+)")
            clothing_priority.append("🩳 Hafif giysiler")
        
        # Wind protection
        if wind > 15:
            clothing_recommendations.append("Rüzgar geçirmeyen ceket veya rüzgarlık")
            clothing_priority.append("💨 Rüzgarlık")
        
        # Rain protection
        if precipitation > 0:
            clothing_recommendations.append("Su geçirmez mont veya yağmurluk")
            clothing_priority.append("☔ Yağmurluk")
            clothing_recommendations.append("Su geçirmez ayakkabı veya bot")
            clothing_priority.append("👢 Su geçirmez ayakkabı")
        
        # Sun protection
        if uv_index > 3:
            clothing_recommendations.append("Güneş gözlüğü (UV korumalı)")
            clothing_priority.append("🕶️ Güneş gözlüğü")
        if uv_index > 5:
            clothing_recommendations.append("Geniş kenarlı şapka veya kasket")
            clothing_priority.append("🧢 Şapka")
        if uv_index > 7:
            clothing_recommendations.append("Uzun kollu güneş korumalı giysi")
            clothing_priority.append("👔 Uzun kollu")
        
        # Humidity considerations
        if humidity > 70:
            clothing_recommendations.append("Nefes alabilen, terletmeyen kumaşlar (pamuk, keten)")
            clothing_priority.append("🌿 Nefes alabilen kumaş")
        if humidity > 85:
            clothing_recommendations.append("Yedek giysi al, terleme olabilir")
            clothing_priority.append("👕 Yedek giysi")
        
        # Generate comprehensive activity-specific recommendations
        activity_tips = []
        activity_gear = []
        activity_timing = []
        
        # Hiking/Walking
        if any(word in event_type.lower() for word in ["yürüyüş", "hiking", "trekking", "doğa yürüyüşü"]):
            activity_tips.append("Rahat yürüyüş ayakkabısı veya bot giy")
            activity_gear.append("🥾 Yürüyüş ayakkabısı")
            activity_tips.append("En az 2 litre su al")
            activity_gear.append("💧 Su şişesi")
            activity_tips.append("Enerji verici atıştırmalıklar (fındık, meyve)")
            activity_gear.append("🥜 Atıştırmalık")
            activity_tips.append("İlk yardım çantası al")
            activity_gear.append("🏥 İlk yardım çantası")
            if wind > 15:
                activity_tips.append("Rüzgar nedeniyle düşük sıcaklık hissedilebilir")
            if temp_max > 25:
                activity_timing.append("Sabah erken veya akşam geç saatleri tercih et")
        
        # Picnic/Outdoor dining
        elif any(word in event_type.lower() for word in ["piknik", "picnic", "barbekü", "açık hava yemeği"]):
            activity_tips.append("Piknik örtüsü ve soğutucu al")
            activity_gear.append("🧺 Piknik örtüsü")
            activity_tips.append("Böcek kovucu sprey kullan")
            activity_gear.append("🦟 Böcek kovucu")
            activity_tips.append("Güneş şemsiyesi veya gölgelik")
            activity_gear.append("⛱️ Güneş şemsiyesi")
            if temp_max > 30:
                activity_tips.append("Yiyecekleri soğuk tutmak için buz paketi al")
                activity_gear.append("🧊 Buz paketi")
            if wind > 20:
                activity_tips.append("Rüzgar nedeniyle hafif eşyaları sabitle")
        
        # Wedding/Outdoor event
        elif any(word in event_type.lower() for word in ["düğün", "wedding", "açık hava etkinliği", "tören"]):
            activity_tips.append("Açık hava düğünü için yedek kapalı alan planı hazırla")
            activity_tips.append("Misafirler için gölgelik veya şemsiye düşün")
            activity_gear.append("⛱️ Gölgelik")
            activity_tips.append("Ses sistemini rüzgar korumalı yerleştir")
            if precipitation > 5:
                activity_tips.append("Yağmur planı yap, çadır veya kapalı alan hazırla")
                activity_gear.append("🏕️ Yağmur çadırı")
            if temp_max > 30:
                activity_tips.append("Misafirler için soğuk içecek ve fan sağla")
                activity_gear.append("❄️ Soğuk içecek")
        
        # Photography
        elif any(word in event_type.lower() for word in ["fotoğraf", "photography", "çekim", "foto"]):
            activity_tips.append("Kamera ekipmanlarını koruyucu kılıf ile taşı")
            activity_gear.append("📷 Kamera kılıfı")
            activity_tips.append("Altın saatlerde (gün doğumu/batımı) çekim yap")
            activity_timing.append("En iyi ışık: 06:00-08:00 ve 18:00-20:00")
            activity_tips.append("Yedek pil ve hafıza kartı al")
            activity_gear.append("🔋 Yedek pil")
            if wind > 15:
                activity_tips.append("Rüzgar nedeniyle tripod kullan")
                activity_gear.append("📐 Tripod")
            if precipitation > 0:
                activity_tips.append("Kamera için yağmur kılıfı al")
                activity_gear.append("☔ Kamera yağmur kılıfı")
        
        # Sports/Exercise
        elif any(word in event_type.lower() for word in ["spor", "sports", "egzersiz", "koşu", "futbol"]):
            activity_tips.append("Spor ayakkabısı giy")
            activity_gear.append("👟 Spor ayakkabısı")
            activity_tips.append("Bol su al, hidrasyon önemli")
            activity_gear.append("💧 Su şişesi")
            if temp_max > 25:
                activity_tips.append("Sıcakta spor yaparken dikkatli ol, sık mola ver")
                activity_timing.append("Sabah erken veya akşam geç saatleri tercih et")
            if humidity > 80:
                activity_tips.append("Yüksek nem nedeniyle daha yavaş tempo")
        
        # Beach/Water activities
        elif any(word in event_type.lower() for word in ["plaj", "beach", "deniz", "yüzme", "su"]):
            activity_tips.append("Güneş kremi kullan (SPF 30+)")
            activity_gear.append("🧴 Güneş kremi")
            activity_tips.append("Plaj şemsiyesi veya gölgelik")
            activity_gear.append("⛱️ Plaj şemsiyesi")
            activity_tips.append("Su geçirmez telefon kılıfı")
            activity_gear.append("📱 Su geçirmez kılıf")
            if uv_index > 6:
                activity_tips.append("Güneşin en yoğun olduğu saatlerde (11-15) denizden çık")
                activity_timing.append("En güvenli saatler: 08:00-11:00 ve 15:00-18:00")
        
        # Generate comprehensive safety tips
        safety_tips = []
        safety_priority = []
        
        # Heat safety
        if temp_max > 30:
            safety_tips.append("Sıcak çarpması riski: Bol su iç, gölgede kal")
            safety_priority.append("🔥 Sıcak çarpması riski")
        if temp_max > 35:
            safety_tips.append("Tehlikeli sıcaklık: Açık hava aktivitelerinden kaçın")
            safety_priority.append("🚨 Tehlikeli sıcaklık")
        if heat_index > 40:
            safety_tips.append("Hissedilen sıcaklık çok yüksek, dışarı çıkmayın")
            safety_priority.append("🌡️ Yüksek hissedilen sıcaklık")
        
        # Cold safety
        if temp_min < -5:
            safety_tips.append("Donma riski: Kalın giyin, uzun süre dışarıda kalmayın")
            safety_priority.append("❄️ Donma riski")
        if wind_chill < -10:
            safety_tips.append("Rüzgar soğuğu tehlikeli, korunaklı alanlarda kalın")
            safety_priority.append("💨 Rüzgar soğuğu")
        
        # Wind safety
        if wind > 25:
            safety_tips.append("Güçlü rüzgar: Düşen objelere dikkat edin")
            safety_priority.append("💨 Güçlü rüzgar")
        if wind > 40:
            safety_tips.append("Tehlikeli rüzgar: Açık hava aktivitelerinden kaçının")
            safety_priority.append("🚨 Tehlikeli rüzgar")
        
        # Rain safety
        if precipitation > 10:
            safety_tips.append("Yoğun yağış: Islak yüzeylerde kayma riski")
            safety_priority.append("🌧️ Kayma riski")
        if precipitation > 20:
            safety_tips.append("Aşırı yağış: Sel riski, yüksek yerlere çıkın")
            safety_priority.append("🌊 Sel riski")
        
        # UV safety
        if uv_index > 6:
            safety_tips.append("Yüksek UV: Güneş yanığı riski, korunun")
            safety_priority.append("☀️ Güneş yanığı riski")
        if uv_index > 8:
            safety_tips.append("Çok yüksek UV: 10:00-16:00 arası güneşten kaçının")
            safety_priority.append("🚨 Yüksek UV riski")
        
        # Visibility safety
        if visibility < 5:
            safety_tips.append("Düşük görüş: Dikkatli hareket edin, reflektör kullanın")
            safety_priority.append("🌫️ Düşük görüş")
        if visibility < 1:
            safety_tips.append("Çok düşük görüş: Açık hava aktivitelerinden kaçının")
            safety_priority.append("🚨 Çok düşük görüş")
        
        # General health tips
        health_tips = []
        if humidity > 80:
            health_tips.append("Yüksek nem: Nefes alabilen giysiler giyin")
        if temp_range > 15:
            health_tips.append("Büyük sıcaklık farkı: Katmanlı giyinin")
        if wind > 20 and temp_max < 20:
            health_tips.append("Rüzgar + soğuk: Ekstra koruma gerekli")
        
        # Build the comprehensive recommendation
        recommendation = f"""{suitability_emoji} **ETKİNLİK UYGUNLUĞU: {suitability}** (Skor: {suitability_score}/100)

{' '.join(suitability_details) if suitability_details else 'Hava koşulları genel olarak uygun'}

📊 **DETAYLI HAVA DURUMU ANALİZİ:**
• **Sıcaklık:** {temp_max}°C (maks) / {temp_min}°C (min) / {temp_avg:.1f}°C (ortalama)
• **Hissedilen Sıcaklık:** {heat_index:.1f}°C (sıcaklık) / {wind_chill:.1f}°C (rüzgar soğuğu)
• **Rüzgar:** {wind} km/h
• **Nem:** %{humidity}
• **Yağış:** {precipitation}mm
• **UV İndeksi:** {uv_index} ({'Çok yüksek' if uv_index > 8 else 'Yüksek' if uv_index > 6 else 'Orta' if uv_index > 3 else 'Düşük'})
• **Görüş Mesafesi:** {visibility}km
• **Sıcaklık Farkı:** {temp_range:.1f}°C

📈 **KONFOR DEĞERLENDİRMESİ:**
**Skor:** {comfort_index['score']}/100 - {comfort_index['level']}
**Genel Durum:** {'Mükemmel' if comfort_index['score'] >= 80 else 'İyi' if comfort_index['score'] >= 60 else 'Orta' if comfort_index['score'] >= 40 else 'Kötü'}

⏰ **ZAMAN ÖNERİLERİ:**
{chr(10).join(f"• {rec}" for rec in time_recommendations)}

**En İyi Zamanlar:**
{chr(10).join(f"• {rec}" for rec in optimal_times) if optimal_times else "• Hava koşulları tüm gün uygun"}

👕 **DETAYLI GİYİM ÖNERİLERİ:**
**Temel Giyim:**
{chr(10).join(f"• {rec}" for rec in clothing_recommendations)}

**Öncelikli Eşyalar:**
{chr(10).join(f"• {rec}" for rec in clothing_priority) if clothing_priority else "• Standart giyim yeterli"}

🎯 **ETKİNLİK ÖZEL ÖNERİLERİ:**
**Genel İpuçları:**
{chr(10).join(f"• {rec}" for rec in activity_tips) if activity_tips else "• Genel güvenlik kurallarına uyun"}

**Gerekli Ekipmanlar:**
{chr(10).join(f"• {rec}" for rec in activity_gear) if activity_gear else "• Özel ekipman gerekmiyor"}

**Zamanlama:**
{chr(10).join(f"• {rec}" for rec in activity_timing) if activity_timing else "• Herhangi bir saatte yapılabilir"}

⚠️ **GÜVENLİK UYARILARI:**
{chr(10).join(f"• {rec}" for rec in safety_tips) if safety_tips else "• Özel güvenlik riski yok"}

**Yüksek Öncelikli Riskler:**
{chr(10).join(f"• {rec}" for rec in safety_priority) if safety_priority else "• Risk seviyesi düşük"}

💡 **SAĞLIK İPUÇLARI:**
{chr(10).join(f"• {rec}" for rec in health_tips) if health_tips else "• Genel sağlık önlemleri yeterli"}

🌍 **KONUM BİLGİSİ:**
**Şehir:** {location}
**Tarih:** {date}
**Etkinlik Türü:** {event_type}

**Son Güncelleme:** {__import__('datetime').datetime.now().strftime('%d.%m.%Y %H:%M')}"""

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