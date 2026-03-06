const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyDq_e0DpiFemB0ORVYJzewmi7PxbzJSG_A';

async function listAvailableModels() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    console.log('Fetching available models...');
    
    // List all available models
    const models = await genAI.listModels();
    
    console.log('\n✅ Available models:');
    models.forEach(model => {
      console.log(`- ${model.name} (displayName: ${model.displayName})`);
      console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing models:');
    console.error('Error:', error.message);
  }
}

listAvailableModels();
