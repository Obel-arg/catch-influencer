const https = require('https');

// Credenciales de HypeAuditor
const CLIENT_ID = '2694138';
const API_TOKEN =
  '$2y$04$27ZuGEARpPSjtwdBhJnf6OYuZKqTxKFkGi723IpY4MxJefff3Lgsa';

console.log('🔍 TEST: HypeAuditor con endpoint de PRODUCCIÓN');
console.log('📋 Client ID:', CLIENT_ID);
console.log('🔑 Token:', API_TOKEN.substring(0, 20) + '...');
console.log('');

// Test 1: Petición mínima con endpoint de producción
function testMinimalProduction() {
  console.log('🧪 TEST 1: Petición mínima con endpoint de PRODUCCIÓN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const request = {
    social_network: 'instagram',
    account_has_contacts: true,
  };

  makeRequest('/api/method/auditor.search/', request, 'Minimal Production');
}

// Test 2: Petición con búsqueda en producción
function testSearchProduction() {
  console.log('\n\n🧪 TEST 2: Petición con búsqueda en PRODUCCIÓN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const request = {
    social_network: 'instagram',
    search: ['fashion'],
    account_has_contacts: true,
  };

  makeRequest('/api/method/auditor.search/', request, 'Search Production');
}

// Test 3: Petición con filtros básicos en producción
function testBasicFiltersProduction() {
  console.log('\n\n🧪 TEST 3: Petición con filtros básicos en PRODUCCIÓN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const request = {
    social_network: 'instagram',
    search: ['fashion'],
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
    er: {
      from: 1,
      to: 20,
    },
    account_has_contacts: true,
  };

  makeRequest(
    '/api/method/auditor.search/',
    request,
    'Basic Filters Production',
  );
}

// Test 4: Petición con categorías en producción
function testCategoryProduction() {
  console.log('\n\n🧪 TEST 4: Petición con categorías en PRODUCCIÓN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const request = {
    social_network: 'instagram',
    search: ['fashion'],
    category: {
      include: [1020, 1021], // Beauty, Fashion
    },
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
    account_has_contacts: true,
  };

  makeRequest('/api/method/auditor.search/', request, 'Category Production');
}

// Test 5: Petición con audiencia en producción
function testAudienceProduction() {
  console.log('\n\n🧪 TEST 5: Petición con audiencia en PRODUCCIÓN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const request = {
    social_network: 'instagram',
    search: ['fashion'],
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
    audience_gender: {
      gender: 'female',
      prc: 60,
    },
    audience_age: {
      groups: ['18_24', '25_34'],
      prc: 50,
    },
    account_has_contacts: true,
  };

  makeRequest('/api/method/auditor.search/', request, 'Audience Production');
}

// Test 6: YouTube en producción
function testYouTubeProduction() {
  console.log('\n\n🧪 TEST 6: YouTube en PRODUCCIÓN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const request = {
    social_network: 'youtube',
    search: ['tech'],
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
  };

  makeRequest('/api/method/auditor.search/', request, 'YouTube Production');
}

// Test 7: TikTok en producción
function testTikTokProduction() {
  console.log('\n\n🧪 TEST 7: TikTok en PRODUCCIÓN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const request = {
    social_network: 'tiktok',
    search: ['fashion'],
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
  };

  makeRequest('/api/method/auditor.search/', request, 'TikTok Production');
}

// Test 8: Petición completa según documentación en producción
function testCompleteProduction() {
  console.log('\n\n🧪 TEST 8: Petición completa en PRODUCCIÓN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const request = {
    social_network: 'instagram',
    search: ['fashion'],
    category: {
      include: [1020, 1021],
    },
    subscribers_count: {
      from: 10000,
      to: 100000,
    },
    er: {
      from: 1,
      to: 20,
    },
    account_type: 'human',
    account_has_contacts: true,
    audience_gender: {
      gender: 'female',
      prc: 60,
    },
    audience_age: {
      groups: ['18_24', '25_34'],
      prc: 50,
    },
    account_geo: {
      country: ['us', 'gb'],
    },
    aqs: {
      from: 20,
      to: 45,
    },
    sort: {
      field: 'subscribers_count',
      order: 'desc',
    },
  };

  makeRequest('/api/method/auditor.search/', request, 'Complete Production');
}

// Función helper para hacer peticiones
function makeRequest(endpoint, data, testName) {
  const postData = JSON.stringify(data);

  console.log(`📤 Enviando ${testName}:`);
  console.log(`🌐 Endpoint: https://hypeauditor.com${endpoint}`);
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
                const basic = result.basic || result.account || {};
                const metrics = result.metrics || {};
                console.log(`\n  ${index + 1}. @${basic.username || 'N/A'}`);
                console.log(
                  `     👥 Seguidores: ${
                    metrics.subscribers_count?.value?.toLocaleString() || 'N/A'
                  }`,
                );
                console.log(
                  `     📈 ER: ${metrics.er?.value?.toFixed(2) || 'N/A'}%`,
                );
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
            console.log('\n📋 RESUMEN:');
            console.log(
              '- Si algún test fue exitoso, el endpoint de producción funciona',
            );
            console.log(
              '- Si todos fallan, el problema es del plan, no del endpoint',
            );
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
    testMinimalProduction,
    testSearchProduction,
    testBasicFiltersProduction,
    testCategoryProduction,
    testAudienceProduction,
    testYouTubeProduction,
    testTikTokProduction,
    testCompleteProduction,
  ];

  const currentIndex = tests.findIndex(
    (test) => test.name === currentTest.replace(' Production', 'Production'),
  );
  return tests[currentIndex + 1] || null;
}

// Iniciar tests
testMinimalProduction();
