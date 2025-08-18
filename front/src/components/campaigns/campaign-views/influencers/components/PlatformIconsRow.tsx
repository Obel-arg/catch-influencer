import { getSmallPlatformIcon, getPlatformInfluencerId, getPlatformProfileUrl } from "./InfluencerUtils";

interface PlatformIconsRowProps {
  platformInfo: any;
  activePlatforms: string[];
}

export const PlatformIconsRow = ({ platformInfo, activePlatforms }: PlatformIconsRowProps) => {
  const handlePlatformClick = (platform: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const username = getPlatformInfluencerId(platformInfo, platform);
    if (username) {
      const profileUrl = getPlatformProfileUrl(platform, username);
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const validPlatforms = activePlatforms.filter(platform => {
    const username = getPlatformInfluencerId(platformInfo, platform);
    return username !== null;
  });

  if (validPlatforms.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {validPlatforms.map((platform) => {
        const username = getPlatformInfluencerId(platformInfo, platform);
        if (!username) return null;

        return (
          <button
            key={platform}
            onClick={(e) => handlePlatformClick(platform, e)}
            className="flex items-center justify-center w-6 h-6 rounded-full hover:opacity-70 transition-opacity cursor-pointer"
            title={`Ver perfil en ${platform.charAt(0).toUpperCase() + platform.slice(1)}: @${username}`}
          >
            {getSmallPlatformIcon(platform)}
          </button>
        );
      })}
    </div>
  );
}; 