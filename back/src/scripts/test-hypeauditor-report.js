const https = require('https');

// Credenciales de HypeAuditor
const CLIENT_ID = '2694138';
const API_TOKEN = '$2y$04$27ZuGEARpPSjtwdBhJnf6OYuZKqTxKFkGi723IpY4MxJefff3Lgsa';

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
