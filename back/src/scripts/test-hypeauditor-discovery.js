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

async function testHypeAuditorDiscovery() {
    console.log('🚀 [HYPEAUDITOR DISCOVERY] Probando endpoint de búsqueda sandbox\n');

    try {
        // Búsqueda básica en sandbox
        const searchData = {
            platform: 'instagram',
            minFollowers: 10000,
            maxFollowers: 100000,
            minEngagement: 2.0,
            maxEngagement: 10.0,
            page: 1
        };

        console.log('📤 Enviando petición con datos:', JSON.stringify(searchData, null, 2));
        console.log('');

        const searchResponse = await axios.post(`${BASE_URL}/hypeauditor/discovery/search-sandbox`, searchData, { headers });
        
        console.log('✅ Respuesta del servidor:');
        console.log(`- Success: ${searchResponse.data.success}`);
        console.log(`- Provider: ${searchResponse.data.provider}`);
        console.log(`- Search Time: ${searchResponse.data.metadata?.searchTime}ms`);
        console.log(`- Total Results: ${searchResponse.data.data?.result?.search_results?.length || 0}`);
        console.log(`- Current Page: ${searchResponse.data.data?.result?.current_page}`);
        console.log(`- Queries Left: ${searchResponse.data.data?.result?.queries_left}`);
        console.log('');

        // Mostrar los resultados detallados
        console.log('📋 RESULTADOS DETALLADOS:');
        console.log('========================');
        
        if (searchResponse.data.data?.result?.search_results) {
            searchResponse.data.data.result.search_results.forEach((result, index) => {
                console.log(`\n--- RESULTADO ${index + 1} ---`);
                console.log(`👤 Username: ${result.basic?.username || 'N/A'}`);
                console.log(`📝 Title: ${result.basic?.title || 'N/A'}`);
                console.log(`🖼️  Avatar: ${result.basic?.avatar_url || 'N/A'}`);
                console.log(`🆔 ID: ${result.basic?.id || 'N/A'}`);
                console.log('');
                console.log(`📊 MÉTRICAS:`);
                console.log(`   • Followers: ${result.metrics?.subscribers_count?.value?.toLocaleString() || 'N/A'}`);
                console.log(`   • Engagement Rate: ${result.metrics?.er?.value || 'N/A'}%`);
                console.log(`   • Real Followers: ${result.metrics?.real_subscribers_count?.value?.toLocaleString() || 'N/A'}`);
                console.log(`   • Likes Count: ${result.metrics?.likes_count?.value?.toLocaleString() || 'N/A'}`);
                console.log(`   • Views Avg: ${result.metrics?.views_avg?.value?.toLocaleString() || 'N/A'}`);
                console.log(`   • Comments Avg: ${result.metrics?.comments_avg?.value?.toLocaleString() || 'N/A'}`);
                console.log(`   • Shares Avg: ${result.metrics?.shares_avg?.value?.toLocaleString() || 'N/A'}`);
                console.log('');
                console.log(`🏷️  FEATURES:`);
                console.log(`   • AQS: ${result.features?.aqs?.data?.mark || 'N/A'}`);
                console.log(`   • CQS: ${result.features?.cqs?.data?.mark || 'N/A'}`);
                
                if (result.features?.social_networks?.length > 0) {
                    const social = result.features.social_networks[0];
                    console.log(`   • Social Network: ${social.type || 'N/A'}`);
                    console.log(`   • Social ID: ${social.social_id || 'N/A'}`);
                    console.log(`   • State: ${social.state || 'N/A'}`);
                } else {
                    console.log(`   • Social Networks: No disponible`);
                }
            });
        } else {
            console.log('❌ No se encontraron resultados');
        }

        console.log('\n🎉 Prueba completada exitosamente!');

    } catch (error) {
        console.error('❌ Error en la prueba:', error.response?.data || error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error Response:', error.response.data);
        }
    }
}

// Ejecutar la prueba
testHypeAuditorDiscovery();
