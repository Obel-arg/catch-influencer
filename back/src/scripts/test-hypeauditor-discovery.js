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

async function testHypeAuditorDiscovery() {
   

    try {
        // Búsqueda básica en producción
        const searchData = {
            platform: 'instagram',
            minFollowers: 10000,
            maxFollowers: 100000,
            minEngagement: 2.0,
            maxEngagement: 10.0,
            page: 1
        };

       

        const searchResponse = await axios.post(`${BASE_URL}/hypeauditor/discovery/search`, searchData, { headers });
        
       

        // Mostrar los resultados detallados
       
        
        if (searchResponse.data.data?.result?.search_results) {
            searchResponse.data.data.result.search_results.forEach((result, index) => {
               
               
                     
               
                
                if (result.features?.social_networks?.length > 0) {
                    const social = result.features.social_networks[0];
                   
                } else {
                   
                }
            });
        } else {
            
        }

        

    } catch (error) {
       
        
        if (error.response) {
           
        }
    }
}

// Ejecutar la prueba
testHypeAuditorDiscovery();
