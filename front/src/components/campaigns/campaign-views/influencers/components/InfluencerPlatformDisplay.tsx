import { getActivePlatformUsernames } from "./InfluencerUtils";

interface InfluencerPlatformDisplayProps {
  platformInfo: any;
  activePlatforms: string[];
}

export const InfluencerPlatformDisplay = ({ platformInfo, activePlatforms }: InfluencerPlatformDisplayProps) => {
  const usernames = getActivePlatformUsernames(platformInfo, activePlatforms);
  
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-gray-600">
      {usernames.length > 0 ? (
        usernames.map((platformData, index) => (
          <div key={index} className="flex items-center gap-1">
            {platformData.icon}
            <span>{platformData.username}</span>
          </div>
        ))
      ) : (
        <span></span>
      )}
    </div>
  );
}; 