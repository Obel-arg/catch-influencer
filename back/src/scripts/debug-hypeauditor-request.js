const https = require('https');

// Credenciales de HypeAuditor
const CLIENT_ID = '2694138';
const API_TOKEN =
  '$2y$04$27ZuGEARpPSjtwdBhJnf6OYuZKqTxKFkGi723IpY4MxJefff3Lgsa';

console.log('🔍 DEBUG: Investigando error 8 de HypeAuditor');
console.log('📋 Client ID:', CLIENT_ID);
console.log('🔑 Token:', API_TOKEN.substring(0, 20) + '...');
console.log('');

// Test 1: Petición mínima válida (formato correcto según documentación)
function testMinimalRequest() {
  console.log('🧪 TEST 1: Petición mínima válida');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const minimalRequest = {
    social_network: 'instagram',
    account_has_contacts: true,
  };

  makeRequest(
    '/api/method/auditor.searchproduction/',
    minimalRequest,
    'Minimal Request',
  );
}

// Test 2: Petición con búsqueda básica (formato correcto)
function testSearchRequest() {
  console.log('\n\n🧪 TEST 2: Petición con búsqueda básica');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const searchRequest = {
    social_network: 'instagram',
    search: ['fashion'],
    account_has_contacts: true,
  };

  makeRequest(
    '/api/method/auditor.searchproduction/',
    searchRequest,
    'Search Request',
  );
}

// Test 3: Petición con filtros de seguidores (formato correcto)
function testFollowersRequest() {
  console.log('\n\n🧪 TEST 3: Petición con filtros de seguidores');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const followersRequest = {
    social_network: 'instagram',
    search: ['fashion'],
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
    account_has_contacts: true,
  };

  makeRequest(
    '/api/method/auditor.searchproduction/',
    followersRequest,
    'Followers Request',
  );
}

// Test 4: Petición con filtros de engagement
function testEngagementRequest() {
  console.log('\n\n🧪 TEST 4: Petición con filtros de engagement');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const engagementRequest = {
    social_network: 'instagram',
    search: ['fashion'],
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
    er: {
      from: 2,
      to: 15,
    },
    page: 1,
  };

  makeRequest(
    '/api/method/auditor.searchproduction/',
    engagementRequest,
    'Engagement Request',
  );
}

// Test 5: Petición con filtros de audiencia
function testAudienceRequest() {
  console.log('\n\n🧪 TEST 5: Petición con filtros de audiencia');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const audienceRequest = {
    social_network: 'instagram',
    search: ['fashion'],
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
    er: {
      from: 2,
      to: 15,
    },
    audience_gender: {
      gender: 'female',
      prc: 60,
    },
    audience_age: {
      groups: [
        { key: '18_24', prc: 40 },
        { key: '25_34', prc: 30 },
      ],
    },
    page: 1,
  };

  makeRequest(
    '/api/method/auditor.searchproduction/',
    audienceRequest,
    'Audience Request',
  );
}

// Test 6: Petición con categorías
function testCategoryRequest() {
  console.log('\n\n🧪 TEST 6: Petición con categorías');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const categoryRequest = {
    social_network: 'instagram',
    search: ['fashion'],
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
    category: {
      include: [1020, 1021], // Beauty, Fashion
    },
    page: 1,
  };

  makeRequest(
    '/api/method/auditor.searchproduction/',
    categoryRequest,
    'Category Request',
  );
}

// Test 7: Petición con tipo de cuenta
function testAccountTypeRequest() {
  console.log('\n\n🧪 TEST 7: Petición con tipo de cuenta');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const accountTypeRequest = {
    social_network: 'instagram',
    search: ['fashion'],
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
    account_type: 'human',
    verified: 1,
    page: 1,
  };

  makeRequest(
    '/api/method/auditor.searchproduction/',
    accountTypeRequest,
    'Account Type Request',
  );
}

// Test 8: Petición con AQS/CQS
function testAqsCqsRequest() {
  console.log('\n\n🧪 TEST 8: Petición con AQS/CQS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const aqsCqsRequest = {
    social_network: 'instagram',
    search: ['fashion'],
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
    aqs: {
      from: 50,
      to: 100,
    },
    page: 1,
  };

  makeRequest(
    '/api/method/auditor.searchproduction/',
    aqsCqsRequest,
    'AQS/CQS Request',
  );
}

// Test 9: Petición con ubicación
function testLocationRequest() {
  console.log('\n\n🧪 TEST 9: Petición con ubicación');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const locationRequest = {
    social_network: 'instagram',
    search: ['fashion'],
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
    account_geo: {
      country: ['US', 'CA'],
    },
    page: 1,
  };

  makeRequest(
    '/api/method/auditor.searchproduction/',
    locationRequest,
    'Location Request',
  );
}

// Test 10: Petición con ordenamiento
function testSortRequest() {
  console.log('\n\n🧪 TEST 10: Petición con ordenamiento');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const sortRequest = {
    social_network: 'instagram',
    search: ['fashion'],
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
    sort: {
      field: 'er',
      order: 'desc',
    },
    page: 1,
  };

  makeRequest(
    '/api/method/auditor.searchproduction/',
    sortRequest,
    'Sort Request',
  );
}

// Función helper para hacer peticiones
function makeRequest(endpoint, data, testName) {
  const postData = JSON.stringify(data);

  console.log(`📤 Enviando ${testName}:`);
  console.log('');

  const options = {
    hostname: 'hypeauditor.com',
    port: 443,
    path: endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Id': CLIENT_ID,
      'X-Auth-Token': API_TOKEN,
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res) => {
    console.log(`📡 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, JSON.stringify(res.headers, null, 2));

    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log(`\n✅ Respuesta recibida para ${testName}:`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (response.error) {
          console.log(`❌ ERROR:`, response.error);
          console.log(`📊 Error Code:`, response.error.code);
          console.log(`📝 Error Description:`, response.error.description);
        } else {
          console.log(`✅ SUCCESS!`);
          console.log(
            `📊 Queries left:`,
            response.result?.queries_left || 'N/A',
          );
          console.log(`📄 Page:`, response.result?.page || 'N/A');
          console.log(
            `🔢 Results count:`,
            response.result?.search_results?.length || 0,
          );

          if (
            response.result?.search_results &&
            response.result.search_results.length > 0
          ) {
            console.log(`\n🎯 Primeros 3 resultados:`);
            response.result.search_results
              .slice(0, 3)
              .forEach((result, index) => {
                console.log(
                  `\n  ${index + 1}. @${
                    result.username || result.account?.username || 'N/A'
                  }`,
                );
                console.log(
                  `     👥 Seguidores: ${
                    result.subscribers_count?.toLocaleString() || 'N/A'
                  }`,
                );
                console.log(`     📈 ER: ${result.er?.toFixed(2) || 'N/A'}%`);
              });
          }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Continuar con el siguiente test después de 2 segundos
        setTimeout(() => {
          const nextTest = getNextTest(testName);
          if (nextTest) {
            nextTest();
          } else {
            console.log('\n🎉 Todos los tests completados!');
          }
        }, 2000);
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
}

// Función para obtener el siguiente test
function getNextTest(currentTest) {
  const tests = [
    testMinimalRequest,
    testSearchRequest,
    testFollowersRequest,
    testEngagementRequest,
    testAudienceRequest,
    testCategoryRequest,
    testAccountTypeRequest,
    testAqsCqsRequest,
    testLocationRequest,
    testSortRequest,
  ];

  const currentIndex = tests.findIndex(
    (test) => test.name === currentTest.replace(' Request', 'Request'),
  );
  return tests[currentIndex + 1] || null;
}

// Iniciar tests
testMinimalRequest();
