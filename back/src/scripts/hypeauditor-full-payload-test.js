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


  const req = https.request(options, (res) => {

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
       
        
        // Análisis detallado de la respuesta
        if (response.result && response.result.search_results) {
         
          
          if (response.result.search_results.length > 0) {
           
            const firstResult = response.result.search_results[0];
            
            // Basic info
           
            
            // Metrics
           
            
            // Features
           
            
            // Social networks
            if (firstResult.features?.social_networks?.length > 0) {
             
              firstResult.features.social_networks.forEach((social, index) => {
               
              });
            }
            
            // Audience data (si está disponible)
            if (firstResult.audience) {
             
            }
            
            // Mostrar TODOS los campos disponibles
            
            
            Object.keys(firstResult).forEach(key => {
              if (typeof firstResult[key] === 'object' && firstResult[key] !== null) {
               
              }
            });
          }
        } else {
         
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


makeFullHypeAuditorRequest();
