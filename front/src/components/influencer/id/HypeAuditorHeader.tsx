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
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
      case "good":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "average":
        return "bg-gradient-to-r from-yellow-500 to-amber-600 text-white";
      case "poor":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      {/* Gradient area - covers avatar, name, and stats only */}
      <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-6">
        <div className="absolute inset-0 bg-black opacity-10"></div>

        <div className="relative flex items-start justify-between">
          {/* Left: Avatar and Name */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full blur-lg opacity-50"></div>
              <img
                src={data.photo_url || "https://via.placeholder.com/96"}
                alt={data.username}
                className="relative w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl"
              />
              {data.is_verified && (
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-3 border-white">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Name and Username */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {data.full_name || data.username}
              </h1>
              <a
                href={`https://instagram.com/${data.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white transition-colors flex items-center gap-2 group text-sm"
              >
                @{data.username}
                <svg
                  className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Stats Cards */}
          <div className="flex items-start gap-3">
            {/* Followers */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/40 shadow-lg min-w-[130px]">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {(data.followers / 1000).toFixed(1)}K
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Seguidores
                </div>
              </div>
            </div>

            {/* Avg Likes */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/40 shadow-lg min-w-[130px]">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <svg
                    className="w-4 h-4 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {data.avg_likes ? (data.avg_likes / 1000).toFixed(1) : "0"}K
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Avg Likes
                </div>
              </div>
            </div>

            {/* Engagement */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/40 shadow-lg min-w-[130px]">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div className="text-xl font-bold text-green-600">
                  {data.engagement_rate?.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Engagement
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* White area - category, location, bio, quality, authenticity */}
      <div className="px-8 py-6">
        <div className="flex items-start justify-between gap-8">
          {/* Left: Details */}
          <div className="flex-1 space-y-4">
            {/* Category Badges */}
            {data.blogger_categories && data.blogger_categories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {data.blogger_categories.map((catId: number) => (
                  <span
                    key={catId}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    {getCategoryName(catId)}
                  </span>
                ))}
              </div>
            )}

            {/* Location and Language */}
            <div className="flex items-center gap-6 text-sm">
              {data.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-medium">{data.location}</span>
                </div>
              )}
              {data.blogger_languages && data.blogger_languages.length > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-medium">{data.blogger_languages[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* About/Bio */}
            {data.about && (
              <p className="text-gray-700 max-w-3xl leading-relaxed">
                {data.about}
              </p>
            )}

            {/* Quality Badge */}
            {data.quality_name && (
              <div className="inline-flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg shadow-sm ${getQualityColor(
                    data.quality_name
                  )}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {data.quality_name}
                </span>
              </div>
            )}
          </div>

          {/* Right: Authenticity Score */}
          {data.authenticity_score && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {/* Circular Progress */}
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#e0e7ff"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(data.authenticity_score / 100) * 251} 251`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-purple-600">
                      {data.authenticity_score}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    Autenticidad
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Score de calidad
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
