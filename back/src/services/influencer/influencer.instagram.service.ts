import { CreatorDBService } from '../creator/creator.service';

export interface InstagramBasic {
  instagramId: string;
  instagramName: string;
  avatar: string;
  country: string;
  lang: string;
  followers: number;
  engagement?: number;
  youtubeId?: string;
  tiktokId?: string;
  [key: string]: any;
}

export class InfluencerInstagramService {
  static async getBasic(instagramId: string): Promise<InstagramBasic | null> {
   
    const ig = await CreatorDBService.getInstagramBasic(instagramId);
    
    let basic = ig?.data;
    
    if (!basic) {
      // Si no hay datos, intentar buscar por nombre de usuario
      const searchRes = await CreatorDBService.searchInstagramInfluencer(instagramId);
      
      if (searchRes && Array.isArray(searchRes.data) && searchRes.data.length > 0) {
        basic = searchRes.data[0];
      }
    }
    
    if (!basic) {
       return null;
    }
    
    // Ya no se limitan los posts recientes - se muestran todos
    const result = basic as InstagramBasic;
        
    return result;
  }
} 