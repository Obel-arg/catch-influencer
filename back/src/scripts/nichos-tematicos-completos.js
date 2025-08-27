#!/usr/bin/env node

/**
 * Script para identificar y clasificar TODOS los nichos temáticos específicos de Instagram
 * Extrae nichos por categorías/industrias específicas
 */

require('dotenv').config();

async function getInstagramNichosTematicoCompletos() {

  const API_KEY = process.env.CREATORDB_API_KEY;
  const BASE_URL = 'https://dev.creatordb.app/v2/topicTable';
  
  if (!API_KEY) {
   
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}?platform=instagram`, {
      headers: { 'Accept': 'application/json', 'apiId': API_KEY }
    });

    const data = await response.json();
    
    if (!data.success || !data.data?.niches) {
     
      return;
    }

    // Convertir a array y ordenar
    const allNiches = Object.entries(data.data.niches)
      .map(([id, niche]) => ({
        id, name: niche.name, channelCount: niche.channelCount, category: niche.category
      }))
      .sort((a, b) => b.channelCount - a.channelCount);

   

    // CLASIFICACIÓN TEMÁTICA ESPECÍFICA
    const nichosTematicosPorCategoria = {
      
      // 🎨 ARTE Y CREATIVIDAD
      "Arte y Creatividad": [
        "art", "photography", "design", "creative", "artist", "drawing", "painting", 
        "illustration", "digital", "sketch", "creative", "artwork", "artoftheday"
      ],
      
      // 👗 MODA Y ESTILO  
      "Moda y Estilo": [
        "fashion", "style", "ootd", "outfit", "fashionista", "streetstyle", "vintage",
        "designer", "clothing", "accessories", "fashionblogger", "styling", "trendy"
      ],
      
      // 💄 BELLEZA Y CUIDADO
      "Belleza y Cuidado": [
        "beauty", "makeup", "skincare", "cosmetics", "beautyblogger", "makeupartist",
        "skincareroutine", "beautytips", "lipstick", "foundation", "eyeshadow", "nails"
      ],
      
      // ✈️ VIAJES Y TURISMO
      "Viajes y Turismo": [
        "travel", "vacation", "wanderlust", "adventure", "travelblogger", "explore",
        "trip", "journey", "destination", "backpacking", "roadtrip", "traveling"
      ],
      
      // 🍕 COMIDA Y GASTRONOMÍA
      "Comida y Gastronomía": [
        "food", "foodie", "cooking", "recipe", "chef", "delicious", "restaurant",
        "foodblogger", "homemade", "yummy", "foodporn", "cuisine", "dinner", "lunch"
      ],
      
      // 💪 FITNESS Y SALUD
      "Fitness y Salud": [
        "fitness", "gym", "workout", "health", "bodybuilding", "yoga", "running",
        "healthylifestyle", "fit", "training", "exercise", "wellness", "nutrition"
      ],
      
      // 🎵 MÚSICA Y ENTRETENIMIENTO
      "Música y Entretenimiento": [
        "music", "song", "singer", "musician", "concert", "band", "guitar", "piano",
        "artist", "musiclover", "newmusic", "musicvideo", "live", "performance"
      ],
      
      // 🎭 ENTRETENIMIENTO Y HUMOR
      "Entretenimiento y Humor": [
        "funny", "comedy", "entertainment", "meme", "laugh", "humor", "comedian",
        "fun", "joke", "viral", "trending", "amusing", "hilarious"
      ],
      
      // 💃 DANZA Y PERFORMANCE
      "Danza y Performance": [
        "dance", "dancing", "choreography", "dancer", "ballet", "hiphop", "salsa",
        "performance", "moves", "rhythm", "dancevideo", "dancechallenge"
      ],
      
      // 🏠 LIFESTYLE Y HOGAR
      "Lifestyle y Hogar": [
        "lifestyle", "home", "homedecor", "interior", "design", "decoration",
        "homedesign", "livingroom", "bedroom", "kitchen", "cozy", "minimalist"
      ],
      
      // 👶 FAMILIA Y MATERNIDAD
      "Familia y Maternidad": [
        "family", "baby", "mom", "dad", "parenting", "kids", "motherhood",
        "pregnancy", "newborn", "children", "familytime", "parenthood"
      ],
      
      // 💍 BODAS Y EVENTOS
      "Bodas y Eventos": [
        "wedding", "bride", "groom", "weddingdress", "engagement", "bridal",
        "weddingday", "ceremony", "reception", "party", "celebration", "event"
      ],
      
      // 🌿 NATURALEZA Y MEDIO AMBIENTE
      "Naturaleza y Medio Ambiente": [
        "nature", "landscape", "sunset", "sunrise", "beach", "ocean", "mountains",
        "forest", "flowers", "plants", "garden", "outdoors", "wildlife", "eco"
      ],
      
      // 📚 EDUCACIÓN Y DESARROLLO
      "Educación y Desarrollo": [
        "education", "learning", "student", "study", "school", "university",
        "knowledge", "motivation", "inspiration", "success", "growth", "development"
      ],
      
      // 🐕 MASCOTAS Y ANIMALES
      "Mascotas y Animales": [
        "pets", "dog", "cat", "puppy", "kitten", "animals", "petlover",
        "dogsofinstagram", "catsofinstagram", "cute", "adorable", "furry"
      ],
      
      // 🏆 DEPORTES Y COMPETENCIAS
      "Deportes y Competencias": [
        "sports", "football", "soccer", "basketball", "tennis", "swimming",
        "athlete", "competition", "championship", "team", "game", "victory"
      ]
    };

    // Buscar nichos que coincidan con cada categoría
    const resultadosTematicos = {};
    
    Object.entries(nichosTematicosPorCategoria).forEach(([categoria, keywords]) => {
      const nichosEncontrados = allNiches.filter(niche => 
        keywords.some(keyword => 
          niche.name.toLowerCase().includes(keyword.toLowerCase()) ||
          keyword.toLowerCase().includes(niche.name.toLowerCase())
        )
      ).slice(0, 15); // Top 15 por categoría
      
      if (nichosEncontrados.length > 0) {
        resultadosTematicos[categoria] = nichosEncontrados;
      }
    });

    // MOSTRAR RESULTADOS POR CATEGORÍA
   

    Object.entries(resultadosTematicos).forEach(([categoria, nichos]) => {
     
      
      nichos.forEach((niche, index) => {
        const rank = (index + 1).toString().padStart(2, '0');
        const channels = niche.channelCount.toLocaleString().padStart(8);
        const popularityLevel = niche.channelCount > 300000 ? '🔥MEGA' : 
                              niche.channelCount > 200000 ? '⚡ALTO' : 
                              niche.channelCount > 100000 ? '📈MEDIO' : '💫MODERADO';
        
       
      });   
    });

    // RESUMEN DE TODOS LOS NICHOS TEMÁTICOS PARA EL FRONTEND
    const todosLosNichosTematicos = [];
    Object.entries(resultadosTematicos).forEach(([categoria, nichos]) => {
      nichos.forEach(niche => {
        todosLosNichosTematicos.push({
          ...niche,
          categoria_tematica: categoria,
          popularity_level: niche.channelCount > 300000 ? 'mega' : 
                           niche.channelCount > 200000 ? 'alto' : 
                           niche.channelCount > 100000 ? 'medio' : 'moderado'
        });
      });
    });

    // Ordenar todos por popularidad
    todosLosNichosTematicos.sort((a, b) => b.channelCount - a.channelCount);

   

    // TOP 30 NICHOS TEMÁTICOS PARA IMPLEMENTAR
    const top30Tematicos = todosLosNichosTematicos.slice(0, 30);
    
   
    
    top30Tematicos.forEach((niche, index) => {
      const rank = (index + 1).toString().padStart(2, '0');
      const channels = niche.channelCount.toLocaleString().padStart(8);
      const category = niche.categoria_tematica.slice(0, 20).padEnd(20);
      
      
    });

    // JSON PARA EL FRONTEND
    const frontendData = {
      timestamp: new Date().toISOString(),
      platform: 'instagram',
      nichos_tematicos_por_categoria: resultadosTematicos,
      top_30_nichos_tematicos: top30Tematicos.map((n, index) => ({
        rank: index + 1,
        id: n.id,
        name: n.name,
        display_name: n.name.charAt(0).toUpperCase() + n.name.slice(1),
        channelCount: n.channelCount,
        categoria_tematica: n.categoria_tematica,
        popularity_level: n.popularity_level,
        recommended_for: 'specific_targeting'
      })),
      categorias_tematicas_disponibles: Object.keys(resultadosTematicos),
      estadisticas: {
        total_categorias: Object.keys(resultadosTematicos).length,
        total_nichos_tematicos: todosLosNichosTematicos.length,
        distribucion_popularidad: {
          mega: todosLosNichosTematicos.filter(n => n.popularity_level === 'mega').length,
          alto: todosLosNichosTematicos.filter(n => n.popularity_level === 'alto').length,
          medio: todosLosNichosTematicos.filter(n => n.popularity_level === 'medio').length,
          moderado: todosLosNichosTematicos.filter(n => n.popularity_level === 'moderado').length
        }
      },
      fuente: 'CreatorDB API v2 - Análisis Temático',
      para_frontend: true
    };

   

  } catch (error) {
   
  }
}

// Verificar fetch
async function ensureFetch() {
  if (typeof fetch === 'undefined') {
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
  }
}

// Ejecutar
if (require.main === module) {
  ensureFetch()
    .then(() => getInstagramNichosTematicoCompletos())
    .then(() => {
     
      process.exit(0);
    })
    .catch((error) => {
     
      process.exit(1);
    });
}

module.exports = { getInstagramNichosTematicoCompletos }; 