import { CreatorDBService } from '../creator/creator.service';

export interface TiktokBasic {
  tiktokId: string;
  tiktokName: string;
  avatar: string;
  country: string;
  lang: string;
  followers: number;
  engagement?: number;
  youtubeId?: string;
  instagramId?: string;
  [key: string]: any;
}

export class InfluencerTiktokService {
  static async getBasic(tiktokId: string): Promise<TiktokBasic | null> {
   
    const tk = await CreatorDBService.getTikTokBasic(tiktokId);
    
    let basic = tk?.data;
    
    if (!basic) {
      // Si no hay datos, intentar buscar por nombre de usuario
      const searchRes = await CreatorDBService.searchTikTokInfluencer(tiktokId);
     
      if (searchRes && Array.isArray(searchRes.data) && searchRes.data.length > 0) {
        basic = searchRes.data[0];
      }
    }
    
    if (!basic) {
      return null;
    }
    
    // Ya no se limitan los posts/videos recientes - se muestran todos
    const result = basic as TiktokBasic;
  
    
    return result;
  }
} 