"use client";

interface HypeAuditorAudienceDemographicsProps {
  data: any;
}

export default function HypeAuditorAudienceDemographics({
  data,
}: HypeAuditorAudienceDemographicsProps) {
  const demographics = data.audience_demographics || {};
  const location = data.audience_location || {};
  const interests = data.audience_interests || [];
  const languages = data.audience_languages || [];
  const education = data.audience_education || {};
  const income = data.audience_income || {};

  const ProgressBar = ({
    label,
    value,
    color = "blue",
  }: {
    label: string;
    value: number;
    color?: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      pink: "bg-pink-500",
    };

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">{label}</span>
          <span className="font-semibold text-gray-900">{value.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              colorClasses[color as keyof typeof colorClasses] ||
              colorClasses["blue"]
            }`}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 space-y-6 pb-8">
      {/* Age Demographics */}
      {Object.keys(demographics.age || {}).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Distribución de Edad
          </h3>
          <div className="space-y-3">
            {Object.entries(demographics.age).map(([ageGroup, percentage]: any) => (
              <ProgressBar
                key={ageGroup}
                label={ageGroup}
                value={percentage}
                color={
                  ageGroup.includes("25-34")
                    ? "blue"
                    : ageGroup.includes("18-24")
                    ? "purple"
                    : ageGroup.includes("35-44")
                    ? "green"
                    : "orange"
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Gender Demographics */}
      {Object.keys(demographics.gender || {}).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Género</h3>
          <div className="space-y-3">
            {Object.entries(demographics.gender).map(([gender, percentage]: any) => (
              <ProgressBar
                key={gender}
                label={gender.charAt(0).toUpperCase() + gender.slice(1)}
                value={percentage}
                color={gender === "male" ? "blue" : "pink"}
              />
            ))}
          </div>
        </div>
      )}

      {/* Top Locations */}
      {Object.keys(location).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Ubicación Geográfica
          </h3>
          <div className="space-y-2">
            {Object.entries(location)
              .sort(([, a]: any, [, b]: any) => b - a)
              .map(([country, percentage]: any, idx) => (
                <div key={country} className="flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar
                      label={country}
                      value={percentage}
                      color={
                        idx === 0
                          ? "blue"
                          : idx === 1
                          ? "purple"
                          : idx === 2
                          ? "green"
                          : "orange"
                      }
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Idiomas</h3>
          <div className="space-y-3">
            {languages.map((lang: any, idx: number) => {
              const langNames: Record<string, string> = {
                es: "Español",
                en: "Inglés",
                pt: "Portugués",
                fr: "Francés",
                de: "Alemán",
                it: "Italiano",
                ru: "Ruso",
                ja: "Japonés",
                zh: "Chino",
                ar: "Árabe",
              };

              return (
                <ProgressBar
                  key={lang.code}
                  label={langNames[lang.code] || lang.code.toUpperCase()}
                  value={lang.value}
                  color={
                    idx === 0
                      ? "blue"
                      : idx === 1
                      ? "purple"
                      : idx === 2
                      ? "green"
                      : "orange"
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Education Level */}
      {Object.keys(education).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Nivel Educativo
          </h3>
          <div className="space-y-3">
            {Object.entries(education).map(([level, percentage]: any) => {
              const levelNames: Record<string, string> = {
                no_education: "Sin educación",
                incomplete_primary: "Primaria incompleta",
                primary: "Primaria completa",
                lower_secondary: "Secundaria inferior",
                upper_secondary: "Secundaria superior",
                post_secondary: "Post-secundaria",
              };

              return (
                <ProgressBar
                  key={level}
                  label={levelNames[level] || level}
                  value={percentage}
                  color="blue"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Income Level */}
      {Object.keys(income).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Nivel de Ingresos
          </h3>
          <div className="space-y-3">
            {Object.entries(income).map(([incomeRange, percentage]: any) => (
              <ProgressBar
                key={incomeRange}
                label={incomeRange}
                value={percentage}
                color="green"
              />
            ))}
          </div>
        </div>
      )}

      {/* Age 21+ */}
      {data.audience_age_21_plus_prc && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            Audiencia Adulta
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-blue-600">
              {data.audience_age_21_plus_prc?.toFixed(1)}%
            </div>
            <p className="text-gray-700">
              de la audiencia tiene 21 años o más
            </p>
          </div>
        </div>
      )}

      {/* Top Interests */}
      {interests.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Intereses Principales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {interests.slice(0, 15).map(([interest, strength]: any, idx: number) => (
              <div
                key={interest}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{interest}</span>
                  <span className="text-xs font-bold text-blue-600">
                    {(strength * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${Math.min(strength * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
