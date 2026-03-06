const https = require('https');

const API_KEY = 'AIzaSyDq_e0DpiFemB0ORVYJzewmi7PxbzJSG_A';

function listModels() {
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ Available models:');
            result.models.forEach(model => {
              console.log(`- ${model.name} (${model.displayName})`);
              console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
              console.log('');
            });
          } else {
            console.log(`❌ Error (${res.statusCode}):`);
            console.log(data);
          }
        } catch (err) {
          console.log('❌ Parse error:', err.message);
          console.log('Raw response:', data);
        }
      });
    }).on('error', (err) => {
      console.log('❌ Request error:', err.message);
    });
  });
}

listModels();
