import { Instagram, Youtube, Twitter, Share } from "lucide-react";

// Componente personalizado para el ícono de TikTok
export const TikTokIcon = ({ className }: { className?: string }) => (
  <img src="/icons/tiktok.svg" alt="TikTok icon" className={className} />
);

// Función para obtener el icono de plataforma más pequeño
export const getSmallPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <Instagram className="h-3 w-3 text-pink-500" />;
    case 'youtube':
      return <Youtube className="h-3 w-3 text-red-500" />;
    case 'twitter':
      return <Twitter className="h-3 w-3 text-blue-500" />;
    case 'tiktok':
      return <TikTokIcon className="h-3 w-3 text-black" />;
    default:
      return <Share className="h-3 w-3 text-gray-500" />;
  }
}; 