const https = require('https');

// Datos hardcodeados
const API_KEY = 'api_df3a5ed06d4949418add37945927d450';
const PLATFORM = 'instagram'; // instagram, youtube, tiktok

// Datos de la petición JSON - Ejemplo básico
const requestData = {
  "filter": {
    "followers": {
      "left_number": 100000,
      "right_number": 1000000
    },
    "engagement_rate": {
      "value": 0.06
    },
    "with_contact": [
      {
        "type": "email"
      },
      {
        "type": "phone"
      }
    ],
    "keywords": ["tech", "innovation"],
    "age": {
      "left_number": 18,
      "right_number": 45
    },
    "gender": {
      "code": "MALE"
    },
    "geo": [
      {
        "id": 304716 // India - puedes cambiar por otros países
      }
    ],
    "audience_gender": {
      "code": "FEMALE",
      "weight": 0.05
    },
    "audience_age_range": {
      "left_number": 18,
      "right_number": 33,
      "weight": 0.05,
      "operator": "gte"
    }
  },
  "paging": {
    "limit": 10,
    "skip": 0
  },
  "sort": {
    "field": "followers",
    "direction": "desc"
  }
};

// Función para hacer la petición POST
function makeInfluencIQRequest() {
  const postData = JSON.stringify(requestData);
  
  const options = {
    hostname: 'influenciq.com',
    port: 443,
    path: `/api/search?platform=${PLATFORM}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'influencer-api-key': API_KEY
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
        if (response.accounts && response.accounts.length > 0) {
          console.log('\n=== RESUMEN DE RESULTADOS ===');
          console.log(`Total de resultados: ${response.total}`);
          console.log(`Resultados encontrados: ${response.accounts.length}`);
          console.log(`Tokens utilizados: ${Math.max(0, response.accounts.length - 3)}`);
          
          console.log('\n=== PRIMEROS 3 RESULTADOS ===');
          response.accounts.slice(0, 3).forEach((result, index) => {
            console.log(`\n--- Resultado ${index + 1} ---`);
            if (result.account && result.account.user_profile) {
              const profile = result.account.user_profile;
              console.log(`Username: ${profile.username}`);
              console.log(`Nombre completo: ${profile.fullname}`);
              console.log(`Seguidores: ${profile.followers.toLocaleString()}`);
              console.log(`Engagement Rate: ${(profile.engagement_rate * 100).toFixed(2)}%`);
              console.log(`Engagements: ${profile.engagements.toLocaleString()}`);
              console.log(`Verificado: ${profile.is_verified ? 'Sí' : 'No'}`);
              console.log(`URL: ${profile.url}`);
            }
            
            // Mostrar datos de audiencia si están disponibles
            if (result.match && result.match.audience_likers && result.match.audience_likers.data) {
              const audience = result.match.audience_likers.data;
              console.log(`Credibilidad de audiencia: ${(audience.audience_credibility * 100).toFixed(2)}%`);
              
              if (audience.audience_ages) {
                console.log('Distribución por edad:');
                audience.audience_ages.forEach(age => {
                  console.log(`  ${age.code}: ${(age.weight * 100).toFixed(1)}%`);
                });
              }
              
              if (audience.audience_genders) {
                console.log('Distribución por género:');
                audience.audience_genders.forEach(gender => {
                  console.log(`  ${gender.code}: ${(gender.weight * 100).toFixed(1)}%`);
                });
              }
            }
          });
        } else {
          console.log('\n❌ No se encontraron resultados');
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
console.log('🔍 Iniciando búsqueda en InfluencIQ...');
console.log('Platform:', PLATFORM);
console.log('API Key:', API_KEY.substring(0, 20) + '...');
console.log('Endpoint: https://influenciq.com/api/search?platform=' + PLATFORM);
console.log('Datos de búsqueda:', JSON.stringify(requestData, null, 2));
console.log('\n' + '='.repeat(50) + '\n');

makeInfluencIQRequest();
