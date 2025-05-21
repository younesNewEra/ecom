// API route for size prediction
import { NextResponse } from 'next/server';
import path from 'path';
import { spawn } from 'child_process';

export async function POST(request) {
  try {
    const data = await request.json();
    const { weight, age, height } = data;
    
    // Validate inputs
    if (!weight || !age || !height) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Option 1: Call local Python script to make prediction
    const result = await runPythonPredictor(weight, age, height);
    
    // Option 2: Call Flask API if it's running
    // const result = await callFlaskAPI(weight, age, height);
    
    // Ensure we return a consistent format to the frontend
    return NextResponse.json({
      predicted_size: result.predicted_size || "Unknown" 
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json({ error: 'Failed to process prediction' }, { status: 500 });
  }
}

// Function to call the Flask API directly
async function callFlaskAPI(weight, age, height) {
  try {
    const response = await fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ weight, age, height }),
    });
    
    if (!response.ok) {
      throw new Error(`Flask API returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling Flask API:', error);
    throw error;
  }
}

// Function to run the local Python script (using the model directly)
function runPythonPredictor(weight, age, height) {
  return new Promise((resolve, reject) => {
    // Path to the Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'predict.py');
    
    // Run Python process 
    const pythonProcess = spawn('python', [
      scriptPath,
      '--weight', weight.toString(),
      '--age', age.toString(),
      '--height', height.toString()
    ]);
    
    let result = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error(`Error output: ${error}`);
        reject(new Error('Failed to get prediction'));
      } else {
        try {
          const prediction = JSON.parse(result);
          resolve(prediction);
        } catch (e) {
          reject(new Error('Failed to parse prediction result'));
        }
      }
    });
  });
}
