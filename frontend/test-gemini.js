const { GoogleGenerativeAI } = require('@google/generative-ai');

// Your API key
const API_KEY = 'AIzaSyBeeEqTNrZwl2VahjYnW8P9p9FrnESpVLo';

async function testGeminiAPI() {
  try {
    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    console.log('Testing Gemini API...');
    
    // Simple test prompt
    const prompt = 'Hello! Can you respond with a simple greeting and confirm the API is working?';
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Key is valid!');
    console.log('Response:', text);
    
  } catch (error) {
    console.error('❌ API Key test failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('The API key appears to be invalid or expired.');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.error('Permission denied. Check if the API key has the correct permissions.');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.error('Quota exceeded. The API key may have reached its usage limit.');
    }
  }
}

testGeminiAPI();
