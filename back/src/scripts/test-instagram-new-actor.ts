import { InstagramMetricsService } from '../services/instagram/instagram-metrics.service';

async function testInstagramNewActor() {
  
  const instagramService = InstagramMetricsService.getInstance();
  
  // Test URL
  const testUrl = 'https://www.instagram.com/p/Ckb6j6MvGQ0/';
  
 
  
  try {
    const result = await instagramService.getPostMetrics(testUrl);
    
    if (result.success && result.data) {
     
      
      // Test conversion to system format
      const systemFormat = instagramService.convertToSystemFormat(
        result.data.postId,
        testUrl,
        result.data
      );
      
      
      
    } else {
     
    }
    
  } catch (error) {
      
  }
}

// Run the test
testInstagramNewActor().catch(console.error); 