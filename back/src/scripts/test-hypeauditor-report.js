const https = require('https');

// Datos hardcodeados
const CLIENT_ID = '360838';
const API_TOKEN = process.env.HYPEAUDITOR_API_TOKEN || '$2y$04$Ai3PO.ApJUZd2tSpIEvrwuJowWPOVY5DwCE4RNnTVTD6ayQHKtZh6';

// Username de Taylor Swift (sin @)
const USERNAME = 'taylorswift';

// Función para hacer la petición GET al endpoint de reporte
function makeHypeAuditorReportRequest() {
  // Construir la URL con parámetros
  const url = `/api/method/auditor.report/?username=${USERNAME}`;
  
  const options = {
    hostname: 'hypeauditor.com',
    port: 443,
    path: url,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Id': CLIENT_ID,
      'X-Auth-Token': API_TOKEN
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ [HYPEAUDITOR] Respuesta del reporte de Taylor Swift:');
        console.log(JSON.stringify(response, null, 2));
        
        // Mostrar información específica del reporte
        if (response.result) {
          console.log('\n=== REPORTE DE TAYLOR SWIFT ===');
          console.log(`📱 Username: ${response.result.username || USERNAME}`);
          
          if (response.result.followers) {
            console.log(`👥 Seguidores: ${response.result.followers.toLocaleString()}`);
          }
          
          if (response.result.engagement_rate) {
            console.log(`📊 Engagement Rate: ${(response.result.engagement_rate * 100).toFixed(2)}%`);
          }
          
          if (response.result.audience_demographics) {
            console.log('\n👥 DEMOGRAFÍA DE AUDIENCIA:');
            if (response.result.audience_demographics.age) {
              console.log('📅 Edad:', response.result.audience_demographics.age);
            }
            if (response.result.audience_demographics.gender) {
              console.log('👤 Género:', response.result.audience_demographics.gender);
            }
          }
          
          if (response.result.audience_location) {
            console.log('\n🌍 UBICACIÓN DE AUDIENCIA:');
            console.log(response.result.audience_location);
          }
          
          if (response.result.authenticity_score) {
            console.log(`🎯 Score de Autenticidad: ${response.result.authenticity_score}`);
          }
          
          if (response.result.quality_score) {
            console.log(`⭐ Score de Calidad: ${response.result.quality_score}`);
          }
        }
        
        // Si no hay resultado, mostrar el mensaje completo
        if (!response.result) {
          console.log('\n📋 RESPUESTA COMPLETA:');
          console.log(response);
        }
        
      } catch (error) {
        console.error('❌ Error al parsear la respuesta JSON:', error);
        console.log('📄 Respuesta raw:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error en la petición:', error);
  });

  req.end();
}

// Ejecutar el script
console.log('🔍 [HYPEAUDITOR] Obteniendo reporte de Instagram para Taylor Swift...');
console.log('📡 Endpoint: https://hypeauditor.com/api/method/auditor.report/');
console.log('👤 Username:', USERNAME);
console.log('🔑 Client ID:', CLIENT_ID);
console.log('🔑 API Token:', API_TOKEN);
console.log('📋 URL completa: https://hypeauditor.com/api/method/auditor.report/?username=taylorswift');
console.log('\n' + '='.repeat(60) + '\n');

makeHypeAuditorReportRequest();
