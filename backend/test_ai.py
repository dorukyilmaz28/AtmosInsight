#!/usr/bin/env python3
"""
Test script for AI recommendation service
"""

import json
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai_recommendation import generate_recommendation

def test_ai_recommendation():
    """Test the AI recommendation function"""
    
    # Sample test data
    weather_data = {
        "daily": {
            "temperature_2m_max": [25.5],
            "temperature_2m_min": [18.2],
            "precipitation_sum": [2.1],
            "windspeed_10m_max": [15.3],
            "relative_humidity_2m_max": [75]
        }
    }
    
    nasa_data = {
        "properties": {
            "parameter": {
                "ALLSKY_SFC_SW_DWN": {"20241005": 250.5},
                "T2M_MAX": {"20241005": 26.0},
                "T2M_MIN": {"20241005": 17.8},
                "RH2M": {"20241005": 72}
            }
        }
    }
    
    comfort_index = {
        "score": 75,
        "level": "İyi",
        "issues": ["Hafif rüzgarlı"]
    }
    
    location = "İstanbul"
    date = "2024-10-05"
    
    try:
        print("Testing AI recommendation...")
        print("=" * 50)
        
        recommendation = generate_recommendation(
            weather_data, nasa_data, comfort_index, location, date
        )
        
        print("✅ AI Recommendation generated successfully!")
        print(f"Location: {location}")
        print(f"Date: {date}")
        print(f"Recommendation: {recommendation}")
        print("=" * 50)
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing AI recommendation: {e}")
        return False

if __name__ == "__main__":
    success = test_ai_recommendation()
    sys.exit(0 if success else 1)
