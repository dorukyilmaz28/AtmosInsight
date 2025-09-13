@echo off
REM Setup script for AI recommendation service on Windows

echo Setting up AI recommendation service...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo pip is not installed. Please install pip.
    pause
    exit /b 1
)

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Make the Python script executable (not needed on Windows, but good practice)
echo Setup complete! The AI recommendation service is ready to use.
echo Note: The first run will download the model (~40GB), which may take some time.

pause
