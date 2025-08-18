import { InstagramMetricsService } from '../services/instagram/instagram-metrics.service';

async function testInstagramNewActor() {
  console.log('🧪 Testing Instagram Metrics Service with new actor...');
  
  const instagramService = InstagramMetricsService.getInstance();
  
  // Test URL
  const testUrl = 'https://www.instagram.com/p/Ckb6j6MvGQ0/';
  
  console.log(`📸 Testing with URL: ${testUrl}`);
  console.log(`🎭 Using actor ID: ${instagramService.getServiceInfo().actorId}`);
  
  try {
    const result = await instagramService.getPostMetrics(testUrl);
    
    if (result.success && result.data) {
      console.log('✅ Success! Instagram metrics extracted:');
      console.log(JSON.stringify(result.data, null, 2));
      
      // Test conversion to system format
      const systemFormat = instagramService.convertToSystemFormat(
        result.data.postId,
        testUrl,
        result.data
      );
      
      console.log('\n🔄 Converted to system format:');
      console.log(JSON.stringify(systemFormat, null, 2));
      
    } else {
      console.error('❌ Failed to extract Instagram metrics:');
      console.error(result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testInstagramNewActor().catch(console.error); 