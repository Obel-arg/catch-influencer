const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Configuración
const BASE_URL = 'http://localhost:5000/api';

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
    console.log('🧪 [AUDIENCE FILTERS TEST] Probando mapeo de filtros de audiencia\n');

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

        console.log('📤 Enviando filtros con audiencia (formato frontend):');
        console.log(JSON.stringify(filtersWithAudience, null, 2));
        console.log('\n');

        const response = await axios.post(`${BASE_URL}/hypeauditor/discovery/search-sandbox`, filtersWithAudience, { headers });
        
        console.log('✅ Respuesta del servidor:');
        console.log(`- Success: ${response.data.success}`);
        console.log(`- Provider: ${response.data.provider}`);
        console.log(`- Results: ${response.data.data?.result?.search_results?.length || 0}`);
        
        // Los logs de transformación deberían aparecer en la consola del servidor
        console.log('\n📝 Revisa la consola del servidor para ver los filtros transformados al formato HypeAuditor');
        
        // Probar también con audienceGender = 'any' (no debería enviar el filtro)
        console.log('\n🧪 Probando con audienceGender = "any" (no debería enviarse a HypeAuditor)');
        
        const filtersWithAnyGender = {
            ...filtersWithAudience,
            audienceGender: {
                gender: 'any',
                percentage: 50
            }
        };

        const response2 = await axios.post(`${BASE_URL}/hypeauditor/discovery/search-sandbox`, filtersWithAnyGender, { headers });
        console.log(`- Success: ${response2.data.success}`);
        console.log('- El filtro audience_gender NO debería aparecer en los logs del servidor');

    } catch (error) {
        console.error('❌ Error en el test:', error.response?.data || error.message);
    }
}

// Ejecutar test
testAudienceFiltersMapping();
