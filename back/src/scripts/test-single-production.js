const https = require('https');

// Credenciales de HypeAuditor
const CLIENT_ID = '2694138';
const API_TOKEN = '$2y$04$27ZuGEARpPSjtwdBhJnf6OYuZKqTxKFkGi723IpY4MxJefff3Lgsa';

console.log('🔍 TEST: Una sola prueba con endpoint de PRODUCCIÓN');
console.log('📋 Client ID:', CLIENT_ID);
console.log('🔑 Token:', API_TOKEN.substring(0, 20) + '...');
console.log('');

// Petición mínima con endpoint de producción
const request = {
  "social_network": "instagram",
  "account_has_contacts": true
};

const postData = JSON.stringify(request);

console.log('📤 Enviando petición:');
console.log('🌐 Endpoint: https://hypeauditor.com/api/method/auditor.search/');
console.log(JSON.stringify(request, null, 2));
console.log('');

const options = {
  hostname: 'hypeauditor.com',
  port: 443,
  path: '/api/method/auditor.search/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Auth-Id': CLIENT_ID,
    'X-Auth-Token': API_TOKEN,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`📡 Status Code: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      console.log('\n✅ Respuesta recibida:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (response.error) {
        console.log(`❌ ERROR:`, response.error);
        console.log(`📊 Error Code:`, response.error.code);
        console.log(`📝 Error Description:`, response.error.description);
      } else {
        console.log(`✅ SUCCESS!`);
        console.log(`📊 Queries left:`, response.result?.queries_left || 'N/A');
        console.log(`📄 Page:`, response.result?.page || 'N/A');
        console.log(`🔢 Results count:`, response.result?.search_results?.length || 0);
        
        if (response.result?.search_results && response.result.search_results.length > 0) {
          console.log(`\n🎯 Primeros 3 resultados:`);
          response.result.search_results.slice(0, 3).forEach((result, index) => {
            const basic = result.basic || result.account || {};
            const metrics = result.metrics || {};
            console.log(`\n  ${index + 1}. @${basic.username || 'N/A'}`);
            console.log(`     👥 Seguidores: ${metrics.subscribers_count?.value?.toLocaleString() || 'N/A'}`);
            console.log(`     📈 ER: ${metrics.er?.value?.toFixed(2) || 'N/A'}%`);
          });
        }
      }
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (error) {
      console.log(`❌ Error parseando respuesta:`, error.message);
      console.log(`📄 Respuesta raw:`, responseData.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.log(`❌ Error en la petición:`, error.message);
});

req.write(postData);
req.end();
