/**
 * Categorías del Taxonomy de HypeAuditor organizadas por plataforma
 */

export interface HypeAuditorCategory {
  id: string;
  name: string;
}

export const HYPEAUDITOR_CATEGORIES = {
  // Instagram (por defecto)
  instagram: [
    { id: '1020', name: 'Beauty' },
    { id: '1021', name: 'Fashion' },
    { id: '1023', name: 'Fitness & Gym' },
    { id: '1035', name: 'Food & Cooking' },
    { id: '1049', name: 'Gaming' },
    { id: '1027', name: 'Music' },
    { id: '1009', name: 'Travel' },
    { id: '1041', name: 'Lifestyle' },
    { id: '1039', name: 'Modeling' },
    { id: '1002', name: 'Art/Artists' },
    { id: '1038', name: 'Photography' },
    { id: '1013', name: 'Sports with a ball' },
    { id: '1033', name: 'Education' },
    { id: '1005', name: 'Business & Careers' },
    { id: '1022', name: 'Health & Medicine' },
    { id: '1000', name: 'Accessories & Jewellery' },
    { id: '1032', name: 'Cinema & Actors/actresses' },
    { id: '1007', name: 'Clothing & Outfits' },
    { id: '1034', name: 'Computers & Gadgets' },
    { id: '1042', name: 'Family' },
    { id: '1006', name: 'Finance & Economics' },
    { id: '1025', name: 'Nature & landscapes' },
    { id: '1031', name: 'Trainers & Coaches' },
    { id: '1050', name: 'Crypto' },
    { id: '1051', name: 'NFT' }
  ] as HypeAuditorCategory[],

  // YouTube
  youtube: [
    { id: '5', name: 'Beauty' },
    { id: '11', name: 'Fashion' },
    { id: '12', name: 'Fitness' },
    { id: '13', name: 'Food & Drinks' },
    { id: '17', name: 'Music & Dance' },
    { id: '21', name: 'Science & Technology' },
    { id: '22', name: 'Sports' },
    { id: '24', name: 'Travel' },
    { id: '25', name: 'Video games' },
    { id: '1', name: 'Animals & Pets' },
    { id: '2', name: 'Animation' },
    { id: '3', name: 'ASMR' },
    { id: '4', name: 'Autos & Vehicles' },
    { id: '6', name: 'Daily vlogs' },
    { id: '7', name: 'Design/art' },
    { id: '8', name: 'DIY & Life Hacks' },
    { id: '9', name: 'Education' },
    { id: '10', name: 'Family & Parenting' },
    { id: '14', name: 'Health & Self Help' },
    { id: '15', name: 'Humor' },
    { id: '16', name: 'Movies' },
    { id: '18', name: 'Mystery' },
    { id: '19', name: 'News & Politics' },
    { id: '20', name: 'Show' },
    { id: '23', name: 'Toys' }
  ] as HypeAuditorCategory[],

  // TikTok
  tiktok: [
    { id: '5', name: 'Beauty' },
    { id: '9', name: 'Dance' },
    { id: '11', name: 'Fashion' },
    { id: '12', name: 'Fitness' },
    { id: '13', name: 'Food & Beverage' },
    { id: '14', name: 'Gaming' },
    { id: '25', name: 'Sport' },
    { id: '26', name: 'Travel' },
    { id: '1', name: 'Animals' },
    { id: '3', name: 'Art' },
    { id: '4', name: 'Auto' },
    { id: '6', name: 'Comedy' },
    { id: '7', name: 'DIY & Life Hacks' },
    { id: '8', name: 'Daily Life' },
    { id: '10', name: 'Family & Parenting' },
    { id: '15', name: 'Health' },
    { id: '16', name: 'Home & Garden' },
    { id: '17', name: 'Love & Dating' },
    { id: '19', name: 'Outdoor Activities' },
    { id: '24', name: 'Science & Education' }
  ] as HypeAuditorCategory[]
};

/**
 * Obtiene las categorías para una plataforma específica
 * Si no se especifica plataforma o es desconocida, retorna Instagram por defecto
 */
export function getCategoriesForPlatform(platform?: string): HypeAuditorCategory[] {
  switch (platform?.toLowerCase()) {
    case 'youtube':
    case 'yt':
      return HYPEAUDITOR_CATEGORIES.youtube;
    case 'tiktok':
    case 'tt':
      return HYPEAUDITOR_CATEGORIES.tiktok;
    case 'instagram':
    case 'ig':
    default:
      return HYPEAUDITOR_CATEGORIES.instagram;
  }
}

/**
 * Obtiene el nombre de la plataforma para mostrar en UI
 */
export function getPlatformDisplayName(platform?: string): string {
  switch (platform?.toLowerCase()) {
    case 'youtube':
    case 'yt':
      return 'YouTube';
    case 'tiktok':
    case 'tt':
      return 'TikTok';
    case 'instagram':
    case 'ig':
    default:
      return 'Instagram';
  }
}
