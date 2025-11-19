"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface HypeAuditorAudienceDemographicsProps {
  data: any;
}

export default function HypeAuditorAudienceDemographics({
  data,
}: HypeAuditorAudienceDemographicsProps) {
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const demographics = data.audience_demographics || {};
  const location = data.audience_location || {};
  const interests = data.audience_interests || [];
  const languages = data.audience_languages || [];
  const education = data.audience_education || {};
  const income = data.audience_income || {};

  // Colors for charts
  const COLORS = {
    blue: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
    purple: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"],
    green: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
    pink: ["#ec4899", "#f472b6", "#f9a8d4", "#fce7f3"],
    orange: ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a"],
  };

  // Prepare data for age chart
  const ageData = Object.entries(demographics.age || {}).map(([age, value]: any) => ({
    name: age,
    value: parseFloat(value.toFixed(1)),
  }));

  // Prepare data for gender chart
  const genderData = Object.entries(demographics.gender || {}).map(([gender, value]: any) => ({
    name: gender === "male" ? "Masculino" : "Femenino",
    value: parseFloat(value.toFixed(1)),
  }));

  // Prepare data for location chart
  const locationData = Object.entries(location)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 10)
    .map(([country, value]: any) => ({
      name: country,
      value: parseFloat(value.toFixed(1)),
    }));

  // Prepare data for languages chart
  const languageNames: Record<string, string> = {
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

  const languagesData = languages.slice(0, 6).map((lang: any) => ({
    name: languageNames[lang.code] || lang.code.toUpperCase(),
    value: parseFloat(lang.value.toFixed(1)),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-blue-600 font-bold">
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-6 space-y-8 pb-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.audience_age_21_plus_prc && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {data.audience_age_21_plus_prc?.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Audiencia 21+ años</p>
              </div>
            </div>
          </div>
        )}
        {demographics.gender?.male && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {demographics.gender.male.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Audiencia Masculina</p>
              </div>
            </div>
          </div>
        )}
        {demographics.gender?.female && (
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">
                  {demographics.gender.female.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Audiencia Femenina</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Age and Gender Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Age Distribution */}
        {ageData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
              Distribución de Edad
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ageData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS.blue[index % COLORS.blue.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Gender Distribution */}
        {genderData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-blue-500 rounded-full"></div>
              Distribución de Género
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.name === "Masculino" ? "#3b82f6" : "#ec4899"}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Geographic Location */}
      {locationData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                Distribución Geográfica
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Top 10 países por audiencia
              </p>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {locationData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.green[index % COLORS.green.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Languages */}
      {languagesData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                Idiomas de la Audiencia
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Idiomas principales hablados
              </p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languagesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {languagesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.purple[index % COLORS.purple.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Education Level */}
      {Object.keys(education).length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsEducationOpen(!isEducationOpen)}
            className="w-full p-6 flex items-center justify-between hover:bg-blue-50/50 transition-colors"
          >
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
              Nivel Educativo
            </h3>
            <svg
              className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${
                isEducationOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isEducationOpen && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <div
                      key={level}
                      className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          {levelNames[level] || level}
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Income Level */}
      {Object.keys(income).length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsIncomeOpen(!isIncomeOpen)}
            className="w-full p-6 flex items-center justify-between hover:bg-green-50/50 transition-colors"
          >
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
              Nivel de Ingresos
            </h3>
            <svg
              className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${
                isIncomeOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isIncomeOpen && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(income).map(([incomeRange, percentage]: any) => (
                  <div
                    key={incomeRange}
                    className="bg-white rounded-xl p-4 border border-green-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        {incomeRange}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Interests */}
      {interests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
            Intereses Principales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interests.slice(0, 15).map(([interest, strength]: any, idx: number) => (
              <div
                key={interest}
                className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900 text-sm">
                    {interest}
                  </span>
                  <span className="text-lg font-bold text-orange-600">
                    {(strength * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-600"
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
