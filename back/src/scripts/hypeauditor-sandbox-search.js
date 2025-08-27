const https = require('https');

// Datos hardcodeados
const CLIENT_ID = '360838';
const API_TOKEN = process.env.HYPEAUDITOR_API_TOKEN || '$2y$04$Ai3PO.ApJUZd2tSpIEvrwuJowWPOVY5DwCE4RNnTVTD6ayQHKtZh6';

// Datos de la petición JSON - Filtros simplificados
const requestData = {
  "social_network": "instagram",
  "search": [
    "tech"
  ],
  "subscribers_count": {
    "from": 10000,
    "to": 1000000
  },
  "er": {
    "from": 2,
    "to": 15
  },
  "account_type": "human",
  "account_has_contacts": true,
  "sort": {
    "field": "er",
    "order": "desc"
  },
  "page": 1
};

// Función para hacer la petición POST
function makeHypeAuditorRequest() {
  const postData = JSON.stringify(requestData);
  
  const options = {
    hostname: 'hypeauditor.com',
    port: 443,
    path: '/api/method/auditor.searchSandbox/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
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
       
        
        // Mostrar información específica de los resultados
        if (response.result && response.result.search_results) {

          
          if (response.result.search_results.length > 0) {
            response.result.search_results.slice(0, 3).forEach((result, index) => {
             
            });
          }
        }
      } catch (error) {
       
      }
    });
  });

  req.on('error', (error) => {
   
  });

  req.write(postData);
  req.end();
}

// Ejecutar el script
  

makeHypeAuditorRequest();
