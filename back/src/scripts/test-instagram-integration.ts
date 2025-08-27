#!/usr/bin/env ts-node

/**
 * Script de prueba para la integración de Instagram
 * Prueba métricas y comentarios usando los actores de Apify
 */

import { InstagramMetricsService } from '../services/instagram/instagram-metrics.service';
import { InstagramCommentsService } from '../services/instagram/instagram-comments.service';
import { PostMetricsService } from '../services/post-metrics/post-metrics.service';

async function testInstagramIntegration() {

  const instagramMetricsService = InstagramMetricsService.getInstance();
  const instagramCommentsService = InstagramCommentsService.getInstance();
  const postMetricsService = new PostMetricsService();

  // URL de prueba de Instagram (reemplazar con una URL real)
  const testPostUrl = 'https://www.instagram.com/p/C1Q2X3Y4Z5A/'; // URL de ejemplo
  
  try {
   

    // 1. Probar extracción de métricas
    const metricsResult = await instagramMetricsService.getPostMetrics(testPostUrl);
    
    if (metricsResult.success && metricsResult.data) {
     
      
      // 2. Probar conversión al formato del sistema
      const systemFormat = instagramMetricsService.convertToSystemFormat(
        metricsResult.data.postId,
        testPostUrl,
        metricsResult.data
      );
      
      
      
    } else {
     
    }

   
    
    // 3. Probar extracción de comentarios
    const commentsResult = await instagramCommentsService.getPostComments(testPostUrl, 50);
    
    if (commentsResult.success && commentsResult.data) {
     
      
      if (commentsResult.data.length > 0) {
        const firstComment = commentsResult.data[0];
       
      }
      
      // 4. Probar conversión al formato del sistema
      const commentsSystemFormat = instagramCommentsService.convertToSystemFormat(
        'test-post-id',
        commentsResult.data
      );
      
     
      
    } else {
     
    }

   
    
    // 5. Probar integración completa con PostMetricsService
    const postId = `test-instagram-${Date.now()}`;
    const fullIntegrationResult = await postMetricsService.extractAndSaveMetrics(
      postId,
      testPostUrl,
      'instagram'
    );
    
    if (fullIntegrationResult.success && fullIntegrationResult.metrics) {
      
      
      // Verificar estructura del raw_response
      const rawResponse = fullIntegrationResult.metrics.raw_response;
      if (rawResponse?.data?.basicInstagramPost) {
       
      } else {
       
      }
      
    } else {
     
    }

    // 6. Probar información del servicio
    
    const metricsServiceInfo = instagramMetricsService.getServiceInfo();
    const commentsServiceInfo = instagramCommentsService.getServiceInfo();
    
    
    

   

  } catch (error) {
   
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testInstagramIntegration()
    .then(() => {
      
      process.exit(0);
    })
    .catch((error) => {
      
      process.exit(1);
    });
}

export { testInstagramIntegration }; 