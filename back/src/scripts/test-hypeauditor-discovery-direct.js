const https = require('https');

// Datos hardcodeados (mismos que el script que funciona)
const CLIENT_ID = '360838';
const API_TOKEN = '$2y$04$Ai3PO.ApJUZd2tSpIEvrwuJowWPOVY5DwCE4RNnTVTD6ayQHKtZh6';

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

  console.log(`🔍 [HYPEAUDITOR DISCOVERY] Haciendo petición a: ${endpoint}`);
  console.log(`📦 [HYPEAUDITOR DISCOVERY] Datos enviados:`, JSON.stringify(data, null, 2));

  const req = https.request(options, (res) => {
    console.log(`📊 [HYPEAUDITOR DISCOVERY] Status: ${res.statusCode}`);
    console.log(`📋 [HYPEAUDITOR DISCOVERY] Headers:`, res.headers);

    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('✅ [HYPEAUDITOR DISCOVERY] Respuesta exitosa:');
        console.log(JSON.stringify(response, null, 2));
        
        // Mostrar información específica si es una respuesta de búsqueda
        if (response.result && response.result.search_results) {
          console.log('\n=== RESULTADOS DE BÚSQUEDA ===');
          console.log(`📊 Total de resultados: ${response.result.search_results.length}`);
          console.log(`📄 Página actual: ${response.result.current_page}`);
          console.log(`📚 Total de páginas: ${response.result.total_pages}`);
          console.log(`🔢 Queries restantes: ${response.result.queries_left}`);
          
          if (response.result.search_results.length > 0) {
            const firstResult = response.result.search_results[0];
            console.log('\n=== PRIMER RESULTADO ===');
            console.log(`👤 Username: ${firstResult.basic?.username}`);
            console.log(`📝 Título: ${firstResult.basic?.title}`);
            console.log(`👥 Seguidores: ${firstResult.metrics?.subscribers_count?.value?.toLocaleString()}`);
            console.log(`📊 Engagement Rate: ${firstResult.metrics?.er?.value}%`);
          }
        }
        
      } catch (error) {
        console.error('❌ [HYPEAUDITOR DISCOVERY] Error al parsear la respuesta JSON:', error);
        console.log('📄 [HYPEAUDITOR DISCOVERY] Respuesta raw:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ [HYPEAUDITOR DISCOVERY] Error en la petición:', error);
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

  console.log(`🔍 [HYPEAUDITOR DISCOVERY] Haciendo petición GET a: ${endpoint}`);

  const req = https.request(options, (res) => {
    console.log(`📊 [HYPEAUDITOR DISCOVERY] Status: ${res.statusCode}`);
    console.log(`📋 [HYPEAUDITOR DISCOVERY] Headers:`, res.headers);

    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('✅ [HYPEAUDITOR DISCOVERY] Respuesta exitosa:');
        console.log(JSON.stringify(response, null, 2));
        
      } catch (error) {
        console.error('❌ [HYPEAUDITOR DISCOVERY] Error al parsear la respuesta JSON:', error);
        console.log('📄 [HYPEAUDITOR DISCOVERY] Respuesta raw:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ [HYPEAUDITOR DISCOVERY] Error en la petición:', error);
  });

  req.end();
}

async function runDiscoveryTests() {
  console.log('🚀 [HYPEAUDITOR DISCOVERY] Iniciando pruebas directas\n');

  // Test 1: Búsqueda básica en sandbox
  console.log('📋 [TEST] === Test 1: Búsqueda Básica Sandbox ===');
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

  console.log('🔍 Endpoint: /api/method/auditor.searchSandbox/');
  makeHypeAuditorDiscoveryRequest('/api/method/auditor.searchSandbox/', searchData);

  // Esperar un poco antes del siguiente test
  setTimeout(() => {
    // Test 2: Búsqueda con filtros adicionales
    console.log('\n📋 [TEST] === Test 2: Búsqueda con Filtros Adicionales ===');
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

    console.log('🔍 Endpoint: /api/method/auditor.searchSandbox/');
    makeHypeAuditorDiscoveryRequest('/api/method/auditor.searchSandbox/', searchData2);
  }, 3000);

  // Esperar un poco antes del siguiente test
  setTimeout(() => {
    // Test 3: Búsqueda de YouTube
    console.log('\n📋 [TEST] === Test 3: Búsqueda de YouTube ===');
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

    console.log('🔍 Endpoint: /api/method/auditor.searchSandbox/');
    makeHypeAuditorDiscoveryRequest('/api/method/auditor.searchSandbox/', searchData3);
  }, 6000);

  // Esperar un poco antes del siguiente test
  setTimeout(() => {
    // Test 4: Taxonomía
    console.log('\n📋 [TEST] === Test 4: Taxonomía ===');
    console.log('🔍 Endpoint: /api/method/auditor.taxonomy');
    makeHypeAuditorDiscoveryGetRequest('/api/method/auditor.taxonomy');
  }, 9000);
}

// Ejecutar las pruebas
console.log('🔍 [HYPEAUDITOR DISCOVERY] Probando endpoints de Discovery Sandbox...');
runDiscoveryTests();
