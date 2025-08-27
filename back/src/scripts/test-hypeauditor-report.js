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
   

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
       
        
        // Mostrar información específica del reporte
        if (response.result) {
         
          
          if (response.result.engagement_rate) {
           
          }
          
          if (response.result.audience_demographics) {
           
            if (response.result.audience_demographics.age) {
             
            }
            if (response.result.audience_demographics.gender) {
             
            }
          }
          
          if (response.result.audience_location) {
           
          }
          
          if (response.result.authenticity_score) {
           
          }
          
          if (response.result.quality_score) {
           
          }
        }
        
        // Si no hay resultado, mostrar el mensaje completo
        if (!response.result) {
         
        }
        
      } catch (error) {
       
      }
    });
  });

  req.on('error', (error) => {
   
  });

  req.end();
}

// Ejecutar el script


makeHypeAuditorReportRequest();
