"use client";

interface HypeAuditorMetricsProps {
  data: any;
}

export default function HypeAuditorMetrics({ data }: HypeAuditorMetricsProps) {
  const MetricCard = ({
    label,
    value,
    suffix = "",
    color = "blue",
  }: {
    label: string;
    value: string | number;
    suffix?: string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-900",
      green: "bg-green-50 border-green-200 text-green-900",
      purple: "bg-purple-50 border-purple-200 text-purple-900",
      orange: "bg-orange-50 border-orange-200 text-orange-900",
    };

    return (
      <div
        className={`border rounded-lg p-4 ${
          colorClasses[color as keyof typeof colorClasses] ||
          colorClasses["blue"]
        }`}
      >
        <p className="text-sm font-medium opacity-75">{label}</p>
        <p className="text-2xl font-bold mt-2">
          {value}
          {suffix && <span className="text-lg ml-1">{suffix}</span>}
        </p>
      </div>
    );
  };

  const prices = data.blogger_prices || {};
  const reach = data.blogger_reach || {};
  const erData = data.er_data || {};

  return (
    <div className="mt-4 space-y-6 pb-8">
      {/* Main Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Seguidores"
          value={(data.followers / 1000).toFixed(1)}
          suffix="K"
          color="blue"
        />
        <MetricCard
          label="Siguiendo"
          value={data.followings}
          color="purple"
        />
        <MetricCard
          label="Posts"
          value={data.posts_count}
          color="green"
        />
        <MetricCard
          label="Promedio Likes"
          value={(data.avg_likes / 1000).toFixed(1)}
          suffix="K"
          color="orange"
        />
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Engagement Rate"
          value={data.engagement_rate?.toFixed(2)}
          suffix="%"
          color="blue"
        />
        <MetricCard
          label="Promedio Comentarios"
          value={data.avg_comments}
          color="purple"
        />
        <MetricCard
          label="Frecuencia de Posts"
          value={data.post_frequency?.toFixed(2)}
          suffix="por mes"
          color="green"
        />
      </div>

      {/* Pricing Information */}
      {Object.keys(prices).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Información de Precios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prices.post_price && (
              <MetricCard
                label="Precio Promedio por Post"
                value={`$${prices.post_price?.toLocaleString()}`}
                color="blue"
              />
            )}
            {prices.post_price_from && prices.post_price_to && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-700">Rango Posts</p>
                <p className="text-xl font-bold text-gray-900 mt-2">
                  ${prices.post_price_from?.toLocaleString()} -{" "}
                  ${prices.post_price_to?.toLocaleString()}
                </p>
              </div>
            )}
            {prices.stories_price && (
              <MetricCard
                label="Precio por Story"
                value={`$${prices.stories_price?.toLocaleString()}`}
                color="green"
              />
            )}
            {prices.cpm && (
              <MetricCard
                label="CPM"
                value={`$${prices.cpm?.toFixed(2)}`}
                color="purple"
              />
            )}
            {prices.cpe && (
              <MetricCard
                label="CPE"
                value={`$${prices.cpe?.toFixed(3)}`}
                color="orange"
              />
            )}
          </div>
        </div>
      )}

      {/* Reach Information */}
      {Object.keys(reach).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Información de Alcance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reach.reach && (
              <MetricCard
                label="Alcance Estimado"
                value={(reach.reach / 1000).toFixed(0)}
                suffix="K"
                color="blue"
              />
            )}
            {reach.impressions && (
              <MetricCard
                label="Impresiones"
                value={(reach.impressions / 1000).toFixed(0)}
                suffix="K"
                color="purple"
              />
            )}
            {reach.stories_reach && (
              <MetricCard
                label="Alcance Stories"
                value={(reach.stories_reach / 1000).toFixed(0)}
                suffix="K"
                color="green"
              />
            )}
            {reach.reach_mark && (
              <div className="border border-green-200 bg-green-50 rounded-lg p-4 text-green-900">
                <p className="text-sm font-medium opacity-75">Calidad Alcance</p>
                <p className="text-2xl font-bold mt-2 capitalize">
                  {reach.reach_mark}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Growth Performance */}
      {data.growth_performance && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Crecimiento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(data.growth_performance).map(([period, metrics]: any) => (
              <div
                key={period}
                className="border border-gray-200 bg-gradient-to-br from-blue-50 to-white rounded-lg p-4"
              >
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  {period}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {metrics.value?.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {metrics.mark_title || metrics.mark}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ER Data History */}
      {erData.performance && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Histórico ER
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(erData.performance).map(([period, metrics]: any) => (
              <div
                key={period}
                className="border border-blue-200 bg-blue-50 rounded-lg p-4"
              >
                <p className="text-xs font-semibold text-blue-700 uppercase">
                  {period}
                </p>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  {metrics.value?.toFixed(2)}%
                </p>
                <div className="text-xs text-blue-600 mt-1 space-y-1">
                  <p>Min: {metrics.min?.toFixed(2)}%</p>
                  <p>Max: {metrics.max?.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yearly Growth Info */}
      {data.yearly_growth && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Crecimiento Anual
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="Crecimiento en 12 Meses"
              value={data.yearly_growth.value?.toFixed(2)}
              suffix="%"
              color="blue"
            />
            <MetricCard
              label="Crecimiento Promedio"
              value={data.yearly_growth.avg?.toFixed(2)}
              suffix="%"
              color="purple"
            />
            <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 text-gray-900 flex flex-col justify-center">
              <p className="text-sm font-medium opacity-75">Evaluación</p>
              <p className="text-2xl font-bold mt-2 capitalize">
                {data.yearly_growth.title}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Growth Warnings */}
      {data.growth && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-900">
          <h4 className="font-semibold flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {data.growth.title}
          </h4>
          <p className="text-sm mt-2">{data.growth.description}</p>
        </div>
      )}
    </div>
  );
}
