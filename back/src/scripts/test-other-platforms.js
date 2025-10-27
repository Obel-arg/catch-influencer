const https = require('https');

// Credenciales de HypeAuditor
const CLIENT_ID = '2694138';
const API_TOKEN = '$2y$04$27ZuGEARpPSjtwdBhJnf6OYuZKqTxKFkGi723IpY4MxJefff3Lgsa';

console.log('🔍 TEST: Probando otras plataformas de HypeAuditor');
console.log('📋 Client ID:', CLIENT_ID);
console.log('🔑 Token:', API_TOKEN.substring(0, 20) + '...');
console.log('');

// Test 1: YouTube
function testYouTube() {
  console.log('🧪 TEST 1: YouTube');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "youtube",
    "search": ["tech"],
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    }
  };

  makeRequest('/api/method/auditor.searchproduction/', request, 'YouTube');
}

// Test 2: TikTok
function testTikTok() {
  console.log('\n\n🧪 TEST 2: TikTok');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "tiktok",
    "search": ["fashion"],
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    }
  };

  makeRequest('/api/method/auditor.searchproduction/', request, 'TikTok');
}

// Test 3: Twitter
function testTwitter() {
  console.log('\n\n🧪 TEST 3: Twitter');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "twitter",
    "search": ["tech"],
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    }
  };

  makeRequest('/api/method/auditor.searchproduction/', request, 'Twitter');
}

// Test 4: Twitch
function testTwitch() {
  console.log('\n\n🧪 TEST 4: Twitch');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "twitch",
    "search": ["gaming"],
    "subscribers_count": {
      "from": 1000,
      "to": 50000
    }
  };

  makeRequest('/api/method/auditor.searchproduction/', request, 'Twitch');
}

// Test 5: Instagram con formato diferente (sin account_has_contacts)
function testInstagramAlternative() {
  console.log('\n\n🧪 TEST 5: Instagram (formato alternativo)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "instagram",
    "search": ["fashion"],
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    }
  };

  makeRequest('/api/method/auditor.searchproduction/', request, 'Instagram Alternative');
}

// Test 6: YouTube con filtros avanzados
function testYouTubeAdvanced() {
  console.log('\n\n🧪 TEST 6: YouTube con filtros avanzados');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "youtube",
    "search": ["tech"],
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    },
    "er": {
      "from": 1,
      "to": 10
    },
    "cqs": {
      "from": 50,
      "to": 100
    },
    "sort": {
      "field": "subscribers_count",
      "order": "desc"
    }
  };

  makeRequest('/api/method/auditor.searchproduction/', request, 'YouTube Advanced');
}

// Test 7: TikTok con filtros avanzados
function testTikTokAdvanced() {
  console.log('\n\n🧪 TEST 7: TikTok con filtros avanzados');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const request = {
    "social_network": "tiktok",
    "search": ["fashion"],
    "subscribers_count": {
      "from": 10000,
      "to": 100000
    },
    "er": {
      "from": 1,
      "to": 15
    },
    "aqs": {
      "from": 50,
      "to": 100
    },
    "sort": {
      "field": "subscribers_count",
      "order": "desc"
    }
  };

  makeRequest('/api/method/auditor.searchproduction/', request, 'TikTok Advanced');
}

// Test 8: Verificar taxonomy
function testTaxonomy() {
  console.log('\n\n🧪 TEST 8: Verificar taxonomy');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  makeRequest('/api/method/auditor.taxonomy', null, 'Taxonomy');
}

// Función helper para hacer peticiones
function makeRequest(endpoint, data, testName) {
  const postData = data ? JSON.stringify(data) : '';
  
  console.log(`📤 Enviando ${testName}:`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log('GET request');
  }
  console.log('');
  
  const options = {
    hostname: 'hypeauditor.com',
    port: 443,
    path: endpoint,
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Id': CLIENT_ID,
      'X-Auth-Token': API_TOKEN,
      ...(data && { 'Content-Length': Buffer.byteLength(postData) })
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
          
          if (testName === 'Taxonomy') {
            console.log(`📊 Total plataformas:`, Object.keys(response.result || {}).length);
            const platforms = Object.keys(response.result || {});
            platforms.forEach(platform => {
              const categories = response.result[platform]?.categories || [];
              console.log(`  ${platform}: ${categories.length} categorías`);
            });
          } else {
            console.log(`📊 Queries left:`, response.result?.queries_left || 'N/A');
            console.log(`📄 Page:`, response.result?.page || 'N/A');
            console.log(`🔢 Results count:`, response.result?.search_results?.length || 0);
            
            if (response.result?.search_results && response.result.search_results.length > 0) {
              console.log(`\n🎯 Primeros 3 resultados:`);
              response.result.search_results.slice(0, 3).forEach((result, index) => {
                const basic = result.basic || result.account || {};
                const metrics = result.metrics || {};
                console.log(`\n  ${index + 1}. @${basic.username || 'N/A'}`);
                console.log(`     👥 Seguidores: ${metrics.subscribers_count?.value?.toLocaleString() || 'N/A'}`);
                console.log(`     📈 ER: ${metrics.er?.value?.toFixed(2) || 'N/A'}%`);
              });
            }
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
            console.log('- Si algún test fue exitoso, esa plataforma está disponible');
            console.log('- Si todos fallan con error 8, el plan no incluye Discovery');
            console.log('- El taxonomy debería funcionar independientemente');
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

  if (data) {
    req.write(postData);
  }
  req.end();
}

// Función para obtener el siguiente test
function getNextTest(currentTest) {
  const tests = [
    testYouTube,
    testTikTok,
    testTwitter,
    testTwitch,
    testInstagramAlternative,
    testYouTubeAdvanced,
    testTikTokAdvanced,
    testTaxonomy
  ];
  
  const currentIndex = tests.findIndex(test => test.name === currentTest);
  return tests[currentIndex + 1] || null;
}

// Iniciar tests
testYouTube();
