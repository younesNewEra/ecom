// test-integration.js
// This script tests the API integration without using the UI

const fetch = require('node-fetch');

const testDirectApi = async () => {
  console.log('Testing direct Next.js API endpoint...');
  
  try {
    const response = await fetch('http://localhost:3000/api/prediction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weight: 70,
        age: 30,
        height: 175,
      }),
    });

    const data = await response.json();
    console.log('✅ Next.js API response:', data);
    return data;
  } catch (error) {
    console.error('❌ Next.js API error:', error.message);
    return null;
  }
};

const testFlaskApi = async () => {
  console.log('Testing Flask API endpoint...');
  
  try {
    const response = await fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weight: 70,
        age: 30,
        height: 175,
      }),
    });

    const data = await response.json();
    console.log('✅ Flask API response:', data);
    return data;
  } catch (error) {
    console.error('❌ Flask API error:', error.message);
    return null;
  }
};

const runTests = async () => {
  console.log('Starting integration tests...');
  console.log('------------------------------');
  
  const nextResult = await testDirectApi();
  console.log('------------------------------');
  const flaskResult = await testFlaskApi();
  
  console.log('------------------------------');
  console.log('Test Summary:');
  
  if (nextResult) {
    console.log('✅ Next.js API: Success');
    console.log(`   Predicted size: ${nextResult.predicted_size}`);
  } else {
    console.log('❌ Next.js API: Failed');
  }
  
  if (flaskResult) {
    console.log('✅ Flask API: Success');
    console.log(`   Predicted size: ${flaskResult.predicted_size}`);
    console.log(`   Raw numeric value: ${flaskResult.predicted_numeric}`);
  } else {
    console.log('❌ Flask API: Failed');
  }
};

// Run the tests
runTests().catch(console.error);
