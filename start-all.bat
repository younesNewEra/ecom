@echo off
echo Starting the Flask API and Next.js app...

:: Check if Python is installed and install required packages
echo Installing required Python packages...
pip install -r .\AI-model\requirements.txt

:: Start the Flask API in a new window
echo Starting Flask API...
start cmd /k "cd c:\Users\HP\Desktop\ecom-service\AI-model && python app.py"

:: Give the Flask API time to start
echo Waiting for Flask API to initialize...
timeout /t 5 /nobreak

:: Start the Next.js app in a new window
echo Starting Next.js app...
start cmd /k "cd c:\Users\HP\Desktop\ecom-service && npm run dev"

echo Both services started!
echo Flask API is running on http://localhost:5000
echo Next.js app is running on http://localhost:3000
echo.
echo Visit http://localhost:3000/prediction to test the size prediction
