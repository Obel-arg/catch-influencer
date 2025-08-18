const { TikTokApiService } = require('../services/social/tiktok-api.service');

async function testNewTikTokImplementation() {
  
  const testUrls = [
    'https://www.tiktok.com/@charlidamelio/video/7106594312292453675',
    'https://www.tiktok.com/@khaby.lame/video/7124527887406525701',
    'https://www.tiktok.com/@therock/video/7137423965982174510'
  ];
  
  for (const url of testUrls) {
    
    try {
      // Probar extracción de thumbnail
      const thumbnail = await TikTokApiService.getThumbnail(url);
      if (thumbnail) {
      }
      
      const videoInfo = await TikTokApiService.getVideoInfo(url);
      if (videoInfo) {
       
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
}

testNewTikTokImplementation().catch(console.error); 