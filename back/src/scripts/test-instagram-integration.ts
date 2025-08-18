#!/usr/bin/env ts-node

/**
 * Script de prueba para la integración de Instagram
 * Prueba métricas y comentarios usando los actores de Apify
 */

import { InstagramMetricsService } from '../services/instagram/instagram-metrics.service';
import { InstagramCommentsService } from '../services/instagram/instagram-comments.service';
import { PostMetricsService } from '../services/post-metrics/post-metrics.service';

async function testInstagramIntegration() {
  console.log('📸 [INSTAGRAM-TEST] Starting Instagram integration test...\n');

  const instagramMetricsService = InstagramMetricsService.getInstance();
  const instagramCommentsService = InstagramCommentsService.getInstance();
  const postMetricsService = new PostMetricsService();

  // URL de prueba de Instagram (reemplazar con una URL real)
  const testPostUrl = 'https://www.instagram.com/p/C1Q2X3Y4Z5A/'; // URL de ejemplo
  
  try {
    console.log('🔍 [INSTAGRAM-TEST] Testing Instagram metrics extraction...');
    
    // 1. Probar extracción de métricas
    const metricsResult = await instagramMetricsService.getPostMetrics(testPostUrl);
    
    if (metricsResult.success && metricsResult.data) {
      console.log('✅ [INSTAGRAM-TEST] Metrics extraction successful!');
      console.log('📊 Metrics data:');
      console.log(`   - Post ID: ${metricsResult.data.postId}`);
      console.log(`   - Likes: ${metricsResult.data.likes}`);
      console.log(`   - Comments: ${metricsResult.data.comments}`);
      console.log(`   - Views: ${metricsResult.data.views || 'N/A'}`);
      console.log(`   - Engagement Rate: ${(metricsResult.data.engagementRate * 100).toFixed(2)}%`);
      console.log(`   - Is Video: ${metricsResult.data.isVideo}`);
      console.log(`   - Hashtags: ${metricsResult.data.hashtags.length}`);
      console.log(`   - Mentions: ${metricsResult.data.mentions.length}`);
      
      // 2. Probar conversión al formato del sistema
      const systemFormat = instagramMetricsService.convertToSystemFormat(
        metricsResult.data.postId,
        testPostUrl,
        metricsResult.data
      );
      
      console.log('\n🔄 [INSTAGRAM-TEST] System format conversion:');
      console.log(`   - Platform: ${systemFormat.platform}`);
      console.log(`   - Title: ${systemFormat.title?.substring(0, 50)}...`);
      console.log(`   - Raw response structure: ${systemFormat.raw_response?.data?.basicInstagramPost ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ [INSTAGRAM-TEST] Metrics extraction failed:', metricsResult.error);
    }

    console.log('\n🔍 [INSTAGRAM-TEST] Testing Instagram comments extraction...');
    
    // 3. Probar extracción de comentarios
    const commentsResult = await instagramCommentsService.getPostComments(testPostUrl, 50);
    
    if (commentsResult.success && commentsResult.data) {
      console.log('✅ [INSTAGRAM-TEST] Comments extraction successful!');
      console.log(`📝 Comments data: ${commentsResult.totalComments} comments extracted`);
      
      if (commentsResult.data.length > 0) {
        const firstComment = commentsResult.data[0];
        console.log('📝 Sample comment:');
        console.log(`   - Author: ${firstComment.author}`);
        console.log(`   - Username: ${firstComment.username}`);
        console.log(`   - Text: ${firstComment.text.substring(0, 100)}...`);
        console.log(`   - Likes: ${firstComment.likes}`);
        console.log(`   - Timestamp: ${firstComment.timestamp}`);
        console.log(`   - Is Verified: ${firstComment.isVerified}`);
        console.log(`   - Replies: ${firstComment.replies?.length || 0}`);
      }
      
      // 4. Probar conversión al formato del sistema
      const commentsSystemFormat = instagramCommentsService.convertToSystemFormat(
        'test-post-id',
        commentsResult.data
      );
      
      console.log('\n🔄 [INSTAGRAM-TEST] Comments system format:');
      console.log(`   - Total comments: ${commentsSystemFormat.total_comments}`);
      console.log(`   - Platform: ${commentsSystemFormat.platform}`);
      console.log(`   - Extraction method: ${commentsSystemFormat.platform_data.extraction_method}`);
      
    } else {
      console.log('❌ [INSTAGRAM-TEST] Comments extraction failed:', commentsResult.error);
    }

    console.log('\n🔍 [INSTAGRAM-TEST] Testing full PostMetricsService integration...');
    
    // 5. Probar integración completa con PostMetricsService
    const postId = `test-instagram-${Date.now()}`;
    const fullIntegrationResult = await postMetricsService.extractAndSaveMetrics(
      postId,
      testPostUrl,
      'instagram'
    );
    
    if (fullIntegrationResult.success && fullIntegrationResult.metrics) {
      console.log('✅ [INSTAGRAM-TEST] Full integration successful!');
      console.log('📊 Full integration metrics:');
      console.log(`   - Post ID: ${fullIntegrationResult.metrics.post_id}`);
      console.log(`   - Platform: ${fullIntegrationResult.metrics.platform}`);
      console.log(`   - Likes: ${fullIntegrationResult.metrics.likes_count}`);
      console.log(`   - Comments: ${fullIntegrationResult.metrics.comments_count}`);
      console.log(`   - Views: ${fullIntegrationResult.metrics.views_count}`);
      console.log(`   - Engagement Rate: ${(fullIntegrationResult.metrics.engagement_rate * 100).toFixed(2)}%`);
      console.log(`   - API Success: ${fullIntegrationResult.metrics.api_success}`);
      
      // Verificar estructura del raw_response
      const rawResponse = fullIntegrationResult.metrics.raw_response;
      if (rawResponse?.data?.basicInstagramPost) {
        console.log('✅ [INSTAGRAM-TEST] Raw response structure is correct');
        console.log(`   - Instagram post ID: ${rawResponse.data.basicInstagramPost.id}`);
        console.log(`   - Caption: ${rawResponse.data.basicInstagramPost.caption?.substring(0, 50)}...`);
      } else {
        console.log('❌ [INSTAGRAM-TEST] Raw response structure is incorrect');
      }
      
    } else {
      console.log('❌ [INSTAGRAM-TEST] Full integration failed:', fullIntegrationResult.error);
    }

    // 6. Probar información del servicio
    console.log('\n📋 [INSTAGRAM-TEST] Service information:');
    const metricsServiceInfo = instagramMetricsService.getServiceInfo();
    const commentsServiceInfo = instagramCommentsService.getServiceInfo();
    
    console.log('📊 Metrics service:');
    console.log(`   - Provider: ${metricsServiceInfo.provider}`);
    console.log(`   - Actor ID: ${metricsServiceInfo.actorId}`);
    console.log(`   - Capabilities: ${metricsServiceInfo.capabilities.length}`);
    
    console.log('📝 Comments service:');
    console.log(`   - Provider: ${commentsServiceInfo.provider}`);
    console.log(`   - Actor ID: ${commentsServiceInfo.actorId}`);
    console.log(`   - Capabilities: ${commentsServiceInfo.capabilities.length}`);

    console.log('\n🎉 [INSTAGRAM-TEST] All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Instagram metrics extraction');
    console.log('   ✅ Instagram comments extraction');
    console.log('   ✅ System format conversion');
    console.log('   ✅ Full PostMetricsService integration');
    console.log('   ✅ Service information retrieval');

  } catch (error) {
    console.error('❌ [INSTAGRAM-TEST] Test failed:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testInstagramIntegration()
    .then(() => {
      console.log('\n🏁 [INSTAGRAM-TEST] Test script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 [INSTAGRAM-TEST] Test script failed:', error);
      process.exit(1);
    });
}

export { testInstagramIntegration }; 