#!/bin/bash

# Setup script for AI recommendation service
echo "Setting up AI recommendation service..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "Python is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "pip is not installed. Please install pip."
    exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Make the Python script executable
chmod +x ai_recommendation.py

echo "Setup complete! The AI recommendation service is ready to use."
echo "Note: The first run will download the model (~40GB), which may take some time."
