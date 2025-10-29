"use client";

interface HypeAuditorHeaderProps {
  data: any;
}

export default function HypeAuditorHeader({ data }: HypeAuditorHeaderProps) {
  const getCategoryName = (categoryId: number) => {
    const categoryMap: Record<number, string> = {
      1041: "Entertainment",
      1043: "Gaming",
      1044: "Beauty",
      1045: "Fashion",
      1046: "Music",
      1047: "Sports",
      1048: "Education",
      1049: "Technology",
      1050: "Travel",
      1051: "Food",
    };
    return categoryMap[categoryId] || "Otro";
  };

  const getQualityColor = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case "very good":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "average":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        {/* Left: Avatar and Info */}
        <div className="flex items-start gap-6 flex-1">
          {/* Avatar */}
          <img
            src={data.photo_url || "https://via.placeholder.com/80"}
            alt={data.username}
            className="w-20 h-20 rounded-full object-cover flex-shrink-0"
          />

          {/* Info */}
          <div className="space-y-3">
            {/* Username and Verification */}
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {data.full_name || data.username}
              </h1>
              {data.is_verified && (
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            <p className="text-gray-600">@{data.username}</p>

            {/* Category */}
            {data.blogger_categories && data.blogger_categories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {data.blogger_categories.map((catId: number) => (
                  <span
                    key={catId}
                    className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                  >
                    {getCategoryName(catId)}
                  </span>
                ))}
              </div>
            )}

            {/* Location and Language */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {data.location && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{data.location}</span>
                </div>
              )}
              {data.blogger_languages && data.blogger_languages.length > 0 && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M4.515 7.521A9.979 9.979 0 0112.5 1c2.328 0 4.5.585 6.408 1.614l1.289-1.289a1 1 0 111.414 1.414L18.5 4.5a1 1 0 010 1.414l-1.289 1.289A9.979 9.979 0 0112.5 10a1 1 0 100-2 7.979 7.979 0 00-3.772.975A6.974 6.974 0 005.5 2a1 1 0 010-2 8.06 8.06 0 00-1.085.073zM2 9a9 9 0 1118 0 9 9 0 01-18 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{data.blogger_languages[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* About/Bio */}
            {data.about && (
              <p className="text-sm text-gray-700 max-w-sm line-clamp-2">
                {data.about}
              </p>
            )}

            {/* Quality */}
            {data.quality_name && (
              <span
                className={`inline-block px-3 py-1 text-xs font-semibold rounded ${getQualityColor(
                  data.quality_name
                )}`}
              >
                {data.quality_name}
              </span>
            )}
          </div>
        </div>

        {/* Right: Key Metrics */}
        <div className="flex flex-col items-end gap-4">
          {/* Main Metrics */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {(data.followers / 1000).toFixed(1)}K
              </div>
              <div className="text-xs text-gray-600 mt-1">Seguidores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {data.avg_likes ? (data.avg_likes / 1000).toFixed(1) : "0"}K
              </div>
              <div className="text-xs text-gray-600 mt-1">Promedio Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.engagement_rate?.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-600 mt-1">ER</div>
            </div>
          </div>

          {/* Authenticity Score */}
          {data.authenticity_score && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="text-white font-bold text-xl">
                  {data.authenticity_score}
                </div>
              </div>
              <span className="text-xs text-gray-600">Autenticidad</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
