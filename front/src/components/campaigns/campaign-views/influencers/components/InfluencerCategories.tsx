import { Badge } from "@/components/ui/badge";

// Función para extraer categorías desde platform_info
export const extractCategoriesFromPlatformInfo = (platformInfo: any): string[] => {
  if (!platformInfo || typeof platformInfo !== 'object') {
    return [];
  }

  const categories: string[] = [];

  try {
    // Extraer de YouTube (datos más ricos)
    if (platformInfo.youtube && typeof platformInfo.youtube === 'object') {
      const youtubeData = platformInfo.youtube;
      
      // Usar la categoría principal
      if (youtubeData.mainCategory) {
        categories.push(youtubeData.mainCategory);
      }

      // Inferir categoría basada en el idioma
      if (youtubeData.lang) {
        const langMap: { [key: string]: string } = {
          'spa': 'Spanish',
          'eng': 'English',
          'por': 'Portuguese',
          'fra': 'French',
          'ita': 'Italian',
          'deu': 'German'
        };
        const language = langMap[youtubeData.lang] || youtubeData.lang;
        if (language) {
          categories.push(language);
        }
      }
    }

    // Extraer de TikTok
    if (platformInfo.tiktok && typeof platformInfo.tiktok === 'object' && platformInfo.tiktok !== null) {
      const tiktokData = platformInfo.tiktok;
      
      // Si hay datos básicos de TikTok
      if (tiktokData.basicTikTok) {
        const data = tiktokData.basicTikTok;
        
        // Si es verificado
        if (data.isVerified) {
          categories.push('Verified');
        }
      }
    }

    // Extraer de Instagram (si está disponible)
    if (platformInfo.instagram && typeof platformInfo.instagram === 'object') {
      const instagramData = platformInfo.instagram;
      if (instagramData.category) {
        categories.push(instagramData.category);
      }
    }

    // Remover duplicados, filtrar categorías vacías y limitar a 5 categorías
    const uniqueCategories = [...new Set(categories)]
      .filter(cat => cat && cat.trim().length > 0)
      .slice(0, 5);
    
    return uniqueCategories;
    
  } catch (error) {
    console.error('Error extracting categories from platform_info:', error);
    return [];
  }
};

interface InfluencerCategoriesProps {
  platformInfo: any;
  staticCategories?: string[];
}

export const InfluencerCategories = ({ platformInfo, staticCategories = [] }: InfluencerCategoriesProps) => {
  // Priorizar categorías de platform_info, luego las categorías estáticas
  const platformCategories = extractCategoriesFromPlatformInfo(platformInfo);
  
  // Combinar ambas listas, priorizando platform_info
  const allCategories = platformCategories.length > 0 
    ? platformCategories 
    : staticCategories;
  
  const displayCategories = allCategories.slice(0, 3);
  
  return (
    <div className="flex justify-center gap-2 mt-2">
      {displayCategories.length > 0 ? (
        displayCategories.map((category: string, index: number) => (
          <Badge key={index} className="bg-teal-100 text-teal-800 hover:bg-teal-200">
            {category}
          </Badge>
        ))
      ) : (
        <Badge variant="outline">Sin categorías</Badge>
      )}
    </div>
  );
}; 