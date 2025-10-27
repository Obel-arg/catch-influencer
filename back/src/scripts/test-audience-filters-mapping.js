const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Configuración
const BASE_URL = 'http://localhost:5001/api';

// Generar token de prueba
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  role: 'admin'
};
const TEST_TOKEN = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });

// Headers para las peticiones
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_TOKEN}`
};

async function testAudienceFiltersMapping() {
   

    try {
        // Filtros de audiencia completos para probar el mapeo
        const filtersWithAudience = {
            platform: 'instagram',
            minFollowers: 10000,
            maxFollowers: 100000,
            page: 1,
            // Filtros de audiencia en formato frontend
            audienceGender: {
                gender: 'female',
                percentage: 65
            },
            audienceAge: {
                minAge: 25,
                maxAge: 45,
                percentage: 40
            },
            audienceGeo: {
                countries: {
                    'AR': 30,
                    'BR': 25,
                    'MX': 20
                },
                cities: {}
            }
        };

       

        const response = await axios.post(`${BASE_URL}/hypeauditor/discovery/search-sandbox`, filtersWithAudience, { headers });
        

        
        // Los logs de transformación deberían aparecer en la consola del servidor
        
        
        // Probar también con audienceGender = 'any' (no debería enviar el filtro)
        
        
        const filtersWithAnyGender = {
            ...filtersWithAudience,
            audienceGender: {
                gender: 'any',
                percentage: 50
            }
        };

        const response2 = await axios.post(`${BASE_URL}/hypeauditor/discovery/search-sandbox`, filtersWithAnyGender, { headers });
        

    } catch (error) {
       
    }
}

// Ejecutar test
testAudienceFiltersMapping();
