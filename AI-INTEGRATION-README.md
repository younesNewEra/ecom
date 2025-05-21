# AI Size Prediction Integration Guide

This document explains how to set up and run the integrated AI size prediction feature.

## Prerequisites

- Node.js (for Next.js app)
- Python 3.7+ (for Flask API and model integration)
- Required Python packages (see `AI-model/requirements.txt`)
- NumPy (needed for array operations with the model)

## Setup Instructions

1. Install Python dependencies:
   ```bash
   cd AI-model
   pip install -r requirements.txt
   pip install numpy
   ```

2. Install Node.js dependencies (if not already done):
   ```bash
   npm install
   ```

3. Test the AI model:
   ```bash
   cd AI-model
   python test_model.py
   ```
   This should show a successful prediction using sample data. You should see output like:
   ```
   Testing model prediction...
   ✓ Model and size map loaded successfully
   ✓ Prediction successful: L
   For a person weighing 70kg, age 30, height 175cm, predicted size is L
   ```

## Running the Application

You have two options to run the system:

### Option 1: Using the start-all.bat script (Recommended)

Simply run the `start-all.bat` script which will launch both the Flask API and Next.js app:

```bash
.\start-all.bat
```

### Option 2: Running components separately

1. Start the Flask API:
   ```bash
   cd AI-model
   python app.py
   ```
   The Flask API will run on http://localhost:5000

2. In a separate terminal, start the Next.js app:
   ```bash
   npm run dev
   ```
   The Next.js app will run on http://localhost:3000

## How to Test the Size Prediction

1. Open your browser and navigate to http://localhost:3000/prediction
2. Enter your height (in cm), weight (in kg), and age
3. Click the "Predict Size" button
4. The system will show your predicted clothing size

## Integration Details

The integration connects the AI model with the Next.js application in the following ways:

1. **Local Python Script**: The Next.js API route uses a Python script to directly access the model
2. **Flask API (Alternative)**: The Next.js API can also call the Flask API if needed

To switch between these methods, edit `app/api/prediction/route.js` and uncomment/comment the appropriate function calls.

## Troubleshooting

### Common Issues

1. **"Failed to process prediction" error:**
   - Make sure the model files (`model.pkl` and `size_map.pkl`) exist in the AI-model directory
   - Verify that you have the correct Python packages installed (especially numpy, joblib and scikit-learn)

2. **Flask API not responding:**
   - Ensure the Flask server is running (check for a terminal window showing Flask)
   - Verify it's running on port 5000
   - Make sure CORS headers are enabled

3. **Model errors:**
   - Check that the model format is compatible with your scikit-learn version
   - Ensure the input features match what the model expects (weight, age, height)

### Testing Tools

We've provided these tools to help with troubleshooting:

1. **Test-Integration.ps1** - PowerShell script to test all API endpoints
   ```
   .\Test-Integration.ps1
   ```

2. **test-integration.js** - Node.js script for testing the integration
   ```
   node test-integration.js
   ```

3. **test_model.py** - Python script to test the model directly
   ```
   cd AI-model
   python test_model.py
   ```

### Getting Help

If you're still experiencing issues:
- Check the browser console for JavaScript errors
- Check the terminal windows for Python errors
- Verify your network connectivity
- Try restarting both servers
