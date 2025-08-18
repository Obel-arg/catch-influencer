import { CreatorDBService } from '../creator/creator.service';

export interface YoutubeBasic {
  youtubeId: string;
  youtubeName: string;
  avatar: string;
  country: string;
  lang: string;
  subscribers: number;
  engageRate1Y?: number;
  tiktokId?: string;
  instagramId?: string;
  [key: string]: any;
}

export class InfluencerYoutubeService {
  static async getBasic(youtubeId: string): Promise<YoutubeBasic | null> {
   
    const yt = await CreatorDBService.getYoutubeBasic(youtubeId);
    
    const basic = yt?.basicYoutube || yt?.data?.basicYoutube;
    
    if (!basic) {
      return null;
    }
    
    // Ya no se limitan los videos recientes - se muestran todos
    const result = basic as YoutubeBasic;
       
    return result;
  }
} 