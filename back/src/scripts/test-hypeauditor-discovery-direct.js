const https = require('https');

// Credenciales de HypeAuditor
const CLIENT_ID = '2694138';
const API_TOKEN = '$2y$04$27ZuGEARpPSjtwdBhJnf6OYuZKqTxKFkGi723IpY4MxJefff3Lgsa';

// Función para hacer peticiones POST a HypeAuditor Discovery
function makeHypeAuditorDiscoveryRequest(endpoint, data) {
  const postData = JSON.stringify(data);
  
  const options = {
    hostname: 'hypeauditor.com',
    port: 443,
    path: endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Id': CLIENT_ID,
      'X-Auth-Token': API_TOKEN,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

 

  const req = https.request(options, (res) => {
   

    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
       
        
        // Mostrar información específica si es una respuesta de búsqueda
        if (response.result && response.result.search_results) {
         
          
          if (response.result.search_results.length > 0) {
            const firstResult = response.result.search_results[0];
           
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

// Función para hacer peticiones GET a HypeAuditor Discovery
function makeHypeAuditorDiscoveryGetRequest(endpoint) {
  const options = {
    hostname: 'hypeauditor.com',
    port: 443,
    path: endpoint,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Id': CLIENT_ID,
      'X-Auth-Token': API_TOKEN
    }
  };

 

  const req = https.request(options, (res) => {
   

    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        
        
      } catch (error) {
       
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ [HYPEAUDITOR DISCOVERY] Error en la petición:', error);
  });

  req.end();
}

async function runDiscoveryTests() {
 

  // Test 1: Búsqueda básica en sandbox
 
  const searchData = {
    social_network: 'instagram',
    subscribers_count: {
      from: 10000,
      to: 100000
    },
    er: {
      from: 2.0,
      to: 10.0
    },
    page: 1
  };

 
  makeHypeAuditorDiscoveryRequest('/api/method/auditor.searchSandbox/', searchData);

  // Esperar un poco antes del siguiente test
  setTimeout(() => {
    // Test 2: Búsqueda con filtros adicionales
   
    const searchData2 = {
      social_network: 'instagram',
      search: ['fitness'],
      subscribers_count: {
        from: 50000,
        to: 500000
      },
      er: {
        from: 3.0,
        to: 15.0
      },
      verified: 1,
      page: 1
    };

   
    makeHypeAuditorDiscoveryRequest('/api/method/auditor.searchSandbox/', searchData2);
  }, 3000);

  // Esperar un poco antes del siguiente test
  setTimeout(() => {
    // Test 3: Búsqueda de YouTube
   
    const searchData3 = {
      social_network: 'youtube',
      subscribers_count: {
        from: 100000,
        to: 1000000
      },
      er: {
        from: 1.0,
        to: 8.0
      },
      page: 1
    };

   
    makeHypeAuditorDiscoveryRequest('/api/method/auditor.searchSandbox/', searchData3);
  }, 6000);

  // Esperar un poco antes del siguiente test
  setTimeout(() => {
    // Test 4: Taxonomía
   
   
    makeHypeAuditorDiscoveryGetRequest('/api/method/auditor.taxonomy');
  }, 9000);
}

// Ejecutar las pruebas
  
runDiscoveryTests();
