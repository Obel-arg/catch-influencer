import React, { useMemo } from "react";

interface InfluencerPlatformStatsProps {
  influencer: any;
  contentTab: 'all' | 'youtube' | 'instagram' | 'tiktok';
  setContentTab: (tab: 'all' | 'youtube' | 'instagram' | 'tiktok') => void;
}

// 🎯 FUNCIÓN PARA LIMPIAR NÚMEROS CON DEMASIADOS DECIMALES
const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return 'Sin datos';
  
  // Si es un número entero, mostrarlo como entero
  if (Number.isInteger(value)) {
    return value.toLocaleString('es-ES');
  }
  
  // Si tiene decimales, limitar a máximo 2 decimales
  const rounded = Math.round(value * 100) / 100;
  
  // Si después de redondear es un entero, mostrarlo sin decimales
  if (Number.isInteger(rounded)) {
    return rounded.toLocaleString('es-ES');
  }
  
  // Si tiene decimales, mostrar máximo 2
  return rounded.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

// 🎯 FUNCIÓN PARA FORMATEAR PORCENTAJES
const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return 'Sin datos';
  
  const percentage = value * 100;
  const rounded = Math.round(percentage * 100) / 100;
  
  // Si es un entero, mostrarlo sin decimales
  if (Number.isInteger(rounded)) {
    return `${rounded}%`;
  }
  
  // Si tiene decimales, mostrar máximo 2
  return `${rounded.toFixed(2)}%`;
};

function getInstagramData(platform_info: any) {
  return (
    platform_info?.instagram?.basicInstagram ||
    platform_info?.instagram?.basicinstagram ||
    platform_info?.instagram ||
    platform_info?.basicInstagram ||
    platform_info?.basicinstagram
  );
}

function getTiktokData(platform_info: any) {
  return (
    platform_info?.tiktok?.basicTikTok ||
    platform_info?.tiktok?.basicTiktok ||
    platform_info?.tiktok ||
    platform_info?.basicTikTok ||
    platform_info?.basicTiktok
  );
}

function getFollowersCount(platformData: any, platformType: string): number {
  if (!platformData) return 0;

  switch (platformType) {
    case 'youtube':
      return platformData.subscribers || platformData.subscriberCount || 0;
    case 'instagram':
      return platformData.followers || platformData.followerCount || 0;
    case 'tiktok':
      return platformData.followers || platformData.followerCount || 0;
    default:
      return 0;
  }
}

function getPlatformColor(platformType: string): string {
  switch (platformType) {
    case 'youtube': return 'bg-red-600';
    case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500';
    case 'tiktok': return 'bg-black';
    default: return 'bg-gray-600';
  }
}

function getPlatformIcon(platformType: string) {
  switch (platformType) {
    case 'youtube':
      return (
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      );
    default:
      return null;
  }
}

function getPlatformName(platformType: string): string {
  switch (platformType) {
    case 'youtube': return 'YouTube';
    case 'instagram': return 'Instagram';
    case 'tiktok': return 'TikTok';
    default: return 'Unknown';
  }
}

export default function InfluencerPlatformStats({ influencer, contentTab, setContentTab }: InfluencerPlatformStatsProps) {
  const yt = influencer.platform_info?.youtube || influencer.platform_info?.basicYoutube;
  const ig = getInstagramData(influencer.platform_info);
  const tk = getTiktokData(influencer.platform_info);

  // 🎯 NUEVA LÓGICA: Ordenar plataformas por número de seguidores
  const sortedPlatforms = useMemo(() => {
    const platforms = [
      { type: 'youtube', data: yt, name: 'YouTube' },
      { type: 'instagram', data: ig, name: 'Instagram' },
      { type: 'tiktok', data: tk, name: 'TikTok' }
    ];

    // Filtrar plataformas que tienen datos
    const platformsWithData = platforms.filter(platform => platform.data);

    // Ordenar por número de seguidores (descendente)
    return platformsWithData.sort((a, b) => {
      const aFollowers = getFollowersCount(a.data, a.type);
      const bFollowers = getFollowersCount(b.data, b.type);
      return bFollowers - aFollowers; // Orden descendente
    });
  }, [yt, ig, tk]);

  // 🎯 NUEVA LÓGICA: Determinar la plataforma principal (la que tiene más seguidores)
  const mainPlatform = useMemo(() => {
    return sortedPlatforms.length > 0 ? sortedPlatforms[0].type : null;
  }, [sortedPlatforms]);

  return (
    <div className="space-y-6">
      {/* Tabs de plataformas */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <div className="flex gap-4 mb-6">
          <button
            className={`pb-2 px-4 font-medium border-b-2 transition-colors ${contentTab === 'all' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-orange-600'}`}
            onClick={() => setContentTab('all')}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              All platforms
            </div>
          </button>
          
          {/* 🎯 NUEVA LÓGICA: Renderizar solo plataformas disponibles */}
          {sortedPlatforms.map((platform) => {
            const { type, name } = platform;
            const isActive = contentTab === type;
            const isMain = type === mainPlatform;
            
            let borderColor = 'border-transparent';
            let textColor = 'text-gray-500';
            let hoverColor = 'hover:text-gray-600';
            
            if (isActive) {
              if (type === 'youtube') {
                borderColor = 'border-red-500';
                textColor = 'text-red-600';
              } else if (type === 'instagram') {
                borderColor = 'border-pink-500';
                textColor = 'text-pink-600';
              } else if (type === 'tiktok') {
                borderColor = 'border-black';
                textColor = 'text-black';
              }
            } else {
              if (type === 'youtube') {
                hoverColor = 'hover:text-red-600';
              } else if (type === 'instagram') {
                hoverColor = 'hover:text-pink-600';
              } else if (type === 'tiktok') {
                hoverColor = 'hover:text-black';
              }
            }
            
            return (
              <button
                key={type}
                className={`pb-2 px-4 font-medium border-b-2 transition-colors ${borderColor} ${textColor} ${hoverColor}`}
                onClick={() => setContentTab(type as 'youtube' | 'instagram' | 'tiktok')}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${getPlatformColor(type)}`}>
                    {getPlatformIcon(type)}
                  </div>
                  {name} {isMain && <span className="text-xs text-orange-600">(Main)</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform statistics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 🎯 NUEVA LÓGICA: Renderizar plataformas en orden de seguidores */}
          {sortedPlatforms.map((platform) => {
            const { type, data, name } = platform;
            const followers = getFollowersCount(data, type);
            const isMainPlatform = type === mainPlatform;
            
            return (
              <div key={type} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">
                    {name} {type === 'youtube' ? 'subscribers' : 'followers'}
                  </h4>
                  {isMainPlatform && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                      Main platform
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getPlatformColor(type)}`}>
                    {getPlatformIcon(type)}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {followers ? followers.toLocaleString('es-ES') : 'Sin datos'}
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>
                        {type === 'youtube' 
                          ? (data?.gRateSubscribers ? formatPercentage(data.gRateSubscribers) : 'Sin datos')
                          : (data?.gRateFollowers ? formatPercentage(data.gRateFollowers) : 'Sin datos')
                        }
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {data ? 'Active' : 'Sin datos'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {/* 🎯 LÓGICA ESPECÍFICA POR PLATAFORMA */}
                  {type === 'youtube' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Active subscribers</span>
                        <span className="font-medium">{data?.engageRate1Y ? formatPercentage(data.engageRate1Y) : 'Sin datos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Average views</span>
                        <span className="font-medium">{data?.avgViews1Y ? formatNumber(data.avgViews1Y) : 'Sin datos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Engagement rate</span>
                        <span className="font-medium">{data?.engageRateR20 ? formatPercentage(data.engageRateR20) : 'Sin datos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Average likes / Comments</span>
                        <span className="font-medium">{data?.avgLikes1Y ? formatNumber(data.avgLikes1Y) : 'Sin datos'} / {data?.avgComments1Y ? formatNumber(data.avgComments1Y) : 'Sin datos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Latest content</span>
                        <span className="font-medium">{data?.lastUploadTime ? new Date(data.lastUploadTime).toLocaleDateString('es-ES') : 'Sin datos'}</span>
                      </div>
                    </>
                  )}
                  
                  {type === 'instagram' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Engagement rate</span>
                        <span className="font-medium">{data?.engageRate ? formatPercentage(data.engageRate) : 'Sin datos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Average likes</span>
                        <span className="font-medium">{data?.avgLikes ? formatNumber(data.avgLikes) : 'Sin datos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Average comments</span>
                        <span className="font-medium">{data?.avgComments ? formatNumber(data.avgComments) : 'Sin datos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total posts</span>
                        <span className="font-medium">{data?.posts ? formatNumber(data.posts) : 'Sin datos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Latest content</span>
                        <span className="font-medium">{data?.recentPosts && data.recentPosts.length > 0 ? new Date(data.recentPosts[0].updateDate).toLocaleDateString('es-ES') : 'Sin datos'}</span>
                      </div>
                    </>
                  )}
                  
                  {type === 'tiktok' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Average plays</span>
                        <span className="font-medium">{data?.avgPlays || data?.avgViews ? formatNumber(data.avgPlays || data.avgViews) : 'Sin datos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Average hearts</span>
                        <span className="font-medium">{data?.avgHearts || data?.avgLikes ? formatNumber(data.avgHearts || data.avgLikes) : 'Sin datos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Average comments</span>
                        <span className="font-medium">{data?.avgComments ? formatNumber(data.avgComments) : 'Sin datos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Engagement rate</span>
                        <span className="font-medium">{data?.engageRate ? formatPercentage(data.engageRate) : 'Sin datos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Latest content</span>
                        <span className="font-medium">{data?.recentVideos && data.recentVideos.length > 0 ? new Date(data.recentVideos[0].uploadDate).toLocaleDateString('es-ES') : data?.recentPosts && data.recentPosts.length > 0 ? new Date(data.recentPosts[0].updateDate).toLocaleDateString('es-ES') : 'Sin datos'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Personal description */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <h4 className="font-semibold text-gray-900">Personal description (bio)</h4>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
              {mainPlatform ? getPlatformName(mainPlatform) : 'YouTube'}
            </span>
          </div>
          <p className="text-gray-700">{influencer.bio || 'Comediante. Curioso profesional.'}</p>
        </div>
      </div>
    </div>
  );
} 