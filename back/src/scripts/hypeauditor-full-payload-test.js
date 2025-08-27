const https = require('https');

// Datos hardcodeados
const CLIENT_ID = '360838';
const API_TOKEN = process.env.HYPEAUDITOR_API_TOKEN || '$2y$04$Ai3PO.ApJUZd2tSpIEvrwuJowWPOVY5DwCE4RNnTVTD6ayQHKtZh6';

// 🔥 PAYLOAD COMPLETO - Todos los campos posibles de HypeAuditor Discovery
const fullRequestData = {
  "social_network": "instagram",
  
  // 🎯 Filtros básicos
  "search": ["fitness", "health"],
  "subscribers_count": {
    "from": 10000,
    "to": 500000
  },
  "er": {
    "from": 2,
    "to": 15
  },
  
  // 📊 Filtros de account
  "account_type": "human",
  "account_has_contacts": true,
  "account_has_launched_advertising": false,
  "account_gender": "female",
  "account_age": {
    "from": 18,
    "to": 45
  },
  "account_geo": {
    "country": ["us", "gb", "ar"],
    "city": [2643743] // Londres como ejemplo
  },
  "account_languages": ["en", "es"],
  
  // 👥 Filtros de audiencia  
  "audience_gender": {
    "gender": "female",
    "prc": 60
  },
  "audience_age": {
    "groups": ["18_24", "25_34"],
    "prc": 50
  },
  "audience_geo": {
    "countries": [
      {
        "id": "us",
        "prc": 30
      },
      {
        "id": "ar", 
        "prc": 25
      }
    ],
    "cities": [
      {
        "id": 2643743,
        "prc": 20
      }
    ]
  },
  
  // 🏷️ Categorías e intereses
  "category": {
    "include": [1018, 1032, 1045] // IDs de categorías de fitness/health
  },
  "interests": [
    {
      "id": 11,
      "prc": 80
    },
    {
      "id": 12, 
      "prc": 70
    }
  ],
  
  // 💰 Precios y monetización
  "blogger_prices": {
    "post_price": {
      "from": 100,
      "to": 5000
    }
  },
  
  // 📈 Métricas de calidad
  "aqs": {
    "from": 40,
    "to": 95
  },
  "comments_rate": {
    "marks": ["good", "excellent"]
  },
  
  // 📱 Métricas de contenido
  "reels_video_views_avg": {
    "from": 5000
  },
  "media_count": {
    "from": 50
  },
  "last_media_time": {
    "from": Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) // Últimos 30 días
  },
  
  // 📊 Crecimiento
  "growth": {
    "period": "30d",
    "from": 5,
    "to": 50
  },
  
  // 🎭 Demografia avanzada
  "ethnicity": [
    {
      "race": "hispanic",
      "prc": 30
    }
  ],
  "income": {
    "id": "25k_50k",
    "prc": 40
  },
  
  // 🔍 Filtros de menciones
  "account_mentions": {
    "include": ["fitness", "workout"],
    "exclude": ["junk", "fast"]
  },
  
  // 📋 Ordenamiento
  "sort": {
    "field": "subscribers_count",
    "order": "desc"
  },
  
  // 🔄 Similares
  "similar": "nike",
  
  "page": 1
};

// Función para hacer la petición POST
function makeFullHypeAuditorRequest() {
  const postData = JSON.stringify(fullRequestData);
  
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

  console.log('🔥 [HYPEAUDITOR FULL] Enviando payload COMPLETO con todos los campos...');
  console.log('📦 [HYPEAUDITOR FULL] Datos enviados:', JSON.stringify(fullRequestData, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  const req = https.request(options, (res) => {
    console.log(`📊 [HYPEAUDITOR FULL] Status: ${res.statusCode}`);
    console.log(`📋 [HYPEAUDITOR FULL] Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        console.log('✅ [HYPEAUDITOR FULL] RESPUESTA COMPLETA:');
        console.log('='.repeat(80));
        console.log(JSON.stringify(response, null, 2));
        console.log('='.repeat(80));
        
        // Análisis detallado de la respuesta
        if (response.result && response.result.search_results) {
          console.log('\n🎯 [HYPEAUDITOR FULL] ANÁLISIS DETALLADO:');
          console.log(`📊 Total de resultados: ${response.result.search_results.length}`);
          console.log(`📄 Página actual: ${response.result.current_page}`);
          console.log(`📚 Total de páginas: ${response.result.total_pages}`);
          console.log(`🔢 Queries restantes: ${response.result.queries_left}`);
          
          if (response.result.search_results.length > 0) {
            console.log('\n🔍 [HYPEAUDITOR FULL] PRIMER RESULTADO DETALLADO:');
            const firstResult = response.result.search_results[0];
            
            // Basic info
            console.log('\n📝 INFORMACIÓN BÁSICA:');
            console.log(`   • Username: ${firstResult.basic?.username || 'N/A'}`);
            console.log(`   • Título: ${firstResult.basic?.title || 'N/A'}`);
            console.log(`   • Avatar: ${firstResult.basic?.avatar_url || 'N/A'}`);
            console.log(`   • ID: ${firstResult.basic?.id || 'N/A'}`);
            
            // Metrics
            console.log('\n📊 MÉTRICAS:');
            console.log(`   • Seguidores: ${firstResult.metrics?.subscribers_count?.value?.toLocaleString() || 'N/A'}`);
            console.log(`   • Engagement Rate: ${firstResult.metrics?.er?.value || 'N/A'}%`);
            console.log(`   • Seguidores reales: ${firstResult.metrics?.real_subscribers_count?.value?.toLocaleString() || 'N/A'}`);
            console.log(`   • Likes promedio: ${firstResult.metrics?.likes_count?.value?.toLocaleString() || 'N/A'}`);
            console.log(`   • Views promedio: ${firstResult.metrics?.views_avg?.value?.toLocaleString() || 'N/A'}`);
            console.log(`   • Comentarios promedio: ${firstResult.metrics?.comments_avg?.value?.toLocaleString() || 'N/A'}`);
            
            // Features
            console.log('\n🏷️ FEATURES Y CALIDAD:');
            console.log(`   • AQS: ${firstResult.features?.aqs?.data?.mark || 'N/A'}`);
            console.log(`   • CQS: ${firstResult.features?.cqs?.data?.mark || 'N/A'}`);
            console.log(`   • Blogger Topics: ${JSON.stringify(firstResult.features?.blogger_topics?.data) || 'N/A'}`);
            
            // Social networks
            if (firstResult.features?.social_networks?.length > 0) {
              console.log('\n🌐 REDES SOCIALES:');
              firstResult.features.social_networks.forEach((social, index) => {
                console.log(`   ${index + 1}. ${social.type || 'N/A'} - ID: ${social.social_id || 'N/A'} - Estado: ${social.state || 'N/A'}`);
              });
            }
            
            // Audience data (si está disponible)
            if (firstResult.audience) {
              console.log('\n👥 DATOS DE AUDIENCIA:');
              console.log(`   • Geo: ${JSON.stringify(firstResult.audience.geo) || 'N/A'}`);
              console.log(`   • Age: ${JSON.stringify(firstResult.audience.age) || 'N/A'}`);
              console.log(`   • Gender: ${JSON.stringify(firstResult.audience.gender) || 'N/A'}`);
            }
            
            // Mostrar TODOS los campos disponibles
            console.log('\n🔍 [HYPEAUDITOR FULL] ESTRUCTURA COMPLETA DEL PRIMER RESULTADO:');
            console.log('📦 Campos disponibles:', Object.keys(firstResult));
            
            Object.keys(firstResult).forEach(key => {
              if (typeof firstResult[key] === 'object' && firstResult[key] !== null) {
                console.log(`   📁 ${key}:`, Object.keys(firstResult[key]));
              }
            });
          }
        } else {
          console.log('❌ [HYPEAUDITOR FULL] No se encontraron resultados en la respuesta');
        }
        
      } catch (error) {
        console.error('❌ [HYPEAUDITOR FULL] Error al parsear la respuesta JSON:', error.message);
        console.log('📄 [HYPEAUDITOR FULL] Respuesta raw:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ [HYPEAUDITOR FULL] Error en la petición:', error.message);
  });

  req.write(postData);
  req.end();
}

// Ejecutar el script
console.log('🚀 [HYPEAUDITOR FULL] Iniciando búsqueda con PAYLOAD COMPLETO...');
console.log('🎯 [HYPEAUDITOR FULL] Endpoint: https://hypeauditor.com/api/method/auditor.searchSandbox/');
console.log('🔑 [HYPEAUDITOR FULL] Client ID:', CLIENT_ID);
console.log('📝 [HYPEAUDITOR FULL] Este payload incluye TODOS los filtros posibles de HypeAuditor\n');

makeFullHypeAuditorRequest();
