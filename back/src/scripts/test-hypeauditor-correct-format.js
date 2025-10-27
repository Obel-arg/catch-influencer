const https = require('https');

// Credenciales de HypeAuditor
const CLIENT_ID = '2694138';
const API_TOKEN = '$2y$04$27ZuGEARpPSjtwdBhJnf6OYuZKqTxKFkGi723IpY4MxJefff3Lgsa';

console.log('🔍 TEST: HypeAuditor con formato correcto según documentación');
console.log('📋 Client ID:', CLIENT_ID);
console.log('🔑 Token:', API_TOKEN.substring(0, 20) + '...');
console.log('');

// Test 1: Petición mínima según documentación oficial
function testMinimalOfficial() {
  console.log('🧪 TEST 1: Petición mínima según documentación oficial');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "instagram",
    "account_has_contacts": true
  };

  makeRequest('/api/method/auditor.searchSandbox/', request, 'Minimal Official');
}

// Test 2: Petición con búsqueda según documentación
function testSearchOfficial() {
  console.log('\n\n🧪 TEST 2: Petición con búsqueda según documentación');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "instagram",
    "search": ["fashion"],
    "account_has_contacts": true
  };

  makeRequest('/api/method/auditor.searchSandbox/', request, 'Search Official');
}

// Test 3: Petición con filtros básicos según documentación
function testBasicFiltersOfficial() {
  console.log('\n\n🧪 TEST 3: Petición con filtros básicos según documentación');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "instagram",
    "search": ["fashion"],
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    },
    "er": {
      "from": 1,
      "to": 20
    },
    "account_has_contacts": true
  };

  makeRequest('/api/method/auditor.searchSandbox/', request, 'Basic Filters Official');
}

// Test 4: Petición con categorías según documentación
function testCategoryOfficial() {
  console.log('\n\n🧪 TEST 4: Petición con categorías según documentación');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "instagram",
    "search": ["fashion"],
    "category": {
      "include": [1020, 1021] // Beauty, Fashion según documentación
    },
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    },
    "account_has_contacts": true
  };

  makeRequest('/api/method/auditor.searchSandbox/', request, 'Category Official');
}

// Test 5: Petición con audiencia según documentación
function testAudienceOfficial() {
  console.log('\n\n🧪 TEST 5: Petición con audiencia según documentación');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "instagram",
    "search": ["fashion"],
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    },
    "audience_gender": {
      "gender": "female",
      "prc": 60
    },
    "audience_age": {
      "groups": ["18_24", "25_34"],
      "prc": 50
    },
    "account_has_contacts": true
  };

  makeRequest('/api/method/auditor.searchSandbox/', request, 'Audience Official');
}

// Test 6: Petición con ubicación según documentación
function testLocationOfficial() {
  console.log('\n\n🧪 TEST 6: Petición con ubicación según documentación');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "instagram",
    "search": ["fashion"],
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    },
    "account_geo": {
      "country": ["us", "gb"]
    },
    "account_has_contacts": true
  };

  makeRequest('/api/method/auditor.searchSandbox/', request, 'Location Official');
}

// Test 7: Petición con tipo de cuenta según documentación
function testAccountTypeOfficial() {
  console.log('\n\n🧪 TEST 7: Petición con tipo de cuenta según documentación');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "instagram",
    "search": ["fashion"],
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    },
    "account_type": "human",
    "account_has_contacts": true,
    "account_has_launched_advertising": true
  };

  makeRequest('/api/method/auditor.searchSandbox/', request, 'Account Type Official');
}

// Test 8: Petición con AQS según documentación
function testAqsOfficial() {
  console.log('\n\n🧪 TEST 8: Petición con AQS según documentación');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "instagram",
    "search": ["fashion"],
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    },
    "aqs": {
      "from": 20,
      "to": 45
    },
    "account_has_contacts": true
  };

  makeRequest('/api/method/auditor.searchSandbox/', request, 'AQS Official');
}

// Test 9: Petición con ordenamiento según documentación
function testSortOfficial() {
  console.log('\n\n🧪 TEST 9: Petición con ordenamiento según documentación');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "instagram",
    "search": ["fashion"],
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    },
    "sort": {
      "field": "subscribers_count",
      "order": "desc"
    },
    "account_has_contacts": true
  };

  makeRequest('/api/method/auditor.searchSandbox/', request, 'Sort Official');
}

// Test 10: Petición completa según documentación
function testCompleteOfficial() {
  console.log('\n\n🧪 TEST 10: Petición completa según documentación');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "instagram",
    "search": ["fashion"],
    "category": {
      "include": [1020, 1021]
    },
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    },
    "er": {
      "from": 1,
      "to": 20
    },
    "account_type": "human",
    "account_has_contacts": true,
    "audience_gender": {
      "gender": "female",
      "prc": 60
    },
    "audience_age": {
      "groups": ["18_24", "25_34"],
      "prc": 50
    },
    "account_geo": {
      "country": ["us", "gb"]
    },
    "aqs": {
      "from": 20,
      "to": 45
    },
    "sort": {
      "field": "subscribers_count",
      "order": "desc"
    }
  };

  makeRequest('/api/method/auditor.searchSandbox/', request, 'Complete Official');
}

// Función helper para hacer peticiones
function makeRequest(endpoint, data, testName) {
  const postData = JSON.stringify(data);
  
  console.log(`📤 Enviando ${testName}:`);
  console.log(JSON.stringify(data, null, 2));
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
        console.log(`\n✅ Respuesta recibida para ${testName}:`);
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
              console.log(`\n  ${index + 1}. @${result.basic?.username || 'N/A'}`);
              console.log(`     👥 Seguidores: ${result.metrics?.subscribers_count?.value?.toLocaleString() || 'N/A'}`);
              console.log(`     📈 ER: ${result.metrics?.er?.value?.toFixed(2) || 'N/A'}%`);
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
    testMinimalOfficial,
    testSearchOfficial,
    testBasicFiltersOfficial,
    testCategoryOfficial,
    testAudienceOfficial,
    testLocationOfficial,
    testAccountTypeOfficial,
    testAqsOfficial,
    testSortOfficial,
    testCompleteOfficial
  ];
  
  const currentIndex = tests.findIndex(test => test.name === currentTest.replace(' Official', 'Official'));
  return tests[currentIndex + 1] || null;
}

// Iniciar tests
testMinimalOfficial();
