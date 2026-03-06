const https = require('https');

const API_KEY = 'AIzaSyDq_e0DpiFemB0ORVYJzewmi7PxbzJSG_A';

function checkModel(modelName) {
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}?key=${API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${modelName} - Available`);
          resolve(true);
        } else {
          console.log(`❌ ${modelName} - Not available (Status: ${res.statusCode})`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ ${modelName} - Error: ${err.message}`);
      resolve(false);
    });
  });
}

async function testCommonModels() {
  console.log('Testing common Gemini models...\n');
  
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash-thinking-exp',
    'gemini-exp-1206',
    'gemini-exp-1121'
  ];
  
  for (const model of models) {
    await checkModel(model);
  }
}

testCommonModels();
