const https = require('https');

// Datos hardcodeados
const CLIENT_ID = '360838';
const API_TOKEN = '$2y$04$Ai3PO.ApJUZd2tSpIEvrwuJowWPOVY5DwCE4RNnTVTD6ayQHKtZh6';

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
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Respuesta completa:');
        console.log(JSON.stringify(response, null, 2));
        
        // Mostrar información específica de los resultados
        if (response.result && response.result.search_results) {
          console.log('\n=== RESUMEN DE RESULTADOS ===');
          console.log(`Total de páginas: ${response.result.total_pages}`);
          console.log(`Página actual: ${response.result.current_page}`);
          console.log(`Consultas restantes: ${response.result.queries_left}`);
          console.log(`Resultados encontrados: ${response.result.search_results.length}`);
          
          if (response.result.search_results.length > 0) {
            console.log('\n=== PRIMEROS 3 RESULTADOS ===');
            response.result.search_results.slice(0, 3).forEach((result, index) => {
              console.log(`\n--- Resultado ${index + 1} ---`);
              console.log(`Username: ${result.basic.username}`);
              console.log(`Título: ${result.basic.title}`);
              console.log(`Seguidores: ${result.metrics.subscribers_count.value}`);
              console.log(`ER: ${result.metrics.er.value}%`);
              console.log(`Seguidores reales: ${result.metrics.real_subscribers_count.value}`);
            });
          }
        }
      } catch (error) {
        console.error('Error al parsear la respuesta JSON:', error);
        console.log('Respuesta raw:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error en la petición:', error);
  });

  req.write(postData);
  req.end();
}

// Ejecutar el script
console.log('Iniciando búsqueda en HypeAuditor Sandbox...');
console.log('Endpoint: https://hypeauditor.com/api/method/auditor.searchSandbox/');
console.log('Client ID:', CLIENT_ID);
console.log('Datos de búsqueda:', JSON.stringify(requestData, null, 2));
console.log('\n' + '='.repeat(50) + '\n');

makeHypeAuditorRequest();
