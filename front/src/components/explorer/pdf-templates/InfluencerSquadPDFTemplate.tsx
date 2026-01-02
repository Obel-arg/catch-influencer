"use client";

import { useMemo } from "react";
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
} from "recharts";
import { AudienceDemographics } from "@/types/audience";
import { PDF_BRANDING } from "@/constants/pdf-branding";

interface InfluencerSquadPDFTemplateProps {
  influencer: any;
  audienceData: AudienceDemographics | null;
}

// Helper to format numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Helper to get platform icon path
const getPlatformIcon = (platform: string) => {
  const platformMap: Record<string, string> = {
    Instagram: "/icons/instagram.svg",
    TikTok: "/icons/tiktok.svg",
    YouTube: "/icons/youtube.svg",
    Facebook: "/icons/facebook.svg",
    Threads: "/icons/threads.svg",
  };
  return platformMap[platform] || "/icons/instagram.svg";
};

export function InfluencerSquadPDFTemplate({
  influencer,
  audienceData,
}: InfluencerSquadPDFTemplateProps) {
  console.log(
    "🎨 Rendering Squad PDF Template with audienceData:",
    audienceData
  );

  // Process gender data
  const genderData = useMemo(() => {
    if (!audienceData?.gender) return [];
    return [
      {
        name: "Mujeres",
        value: parseFloat(audienceData.gender.female.toFixed(1)),
      },
      {
        name: "Hombres",
        value: parseFloat(audienceData.gender.male.toFixed(1)),
      },
    ];
  }, [audienceData]);

  // Process age data
  const ageData = useMemo(() => {
    if (!audienceData?.age) {
      console.log("❌ No age data available:", audienceData);
      return [];
    }
    // Filter out invalid age ranges and sort by age order
    const validAgeRanges = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];
    const data = Object.entries(audienceData.age)
      .filter(([age]) => validAgeRanges.includes(age))
      .map(([age, value]) => ({
        name: age,
        value: typeof value === "number" ? parseFloat(value.toFixed(1)) : 0,
      }))
      .sort(
        (a, b) =>
          validAgeRanges.indexOf(a.name) - validAgeRanges.indexOf(b.name)
      );
    console.log("✅ Age data processed:", data);
    return data;
  }, [audienceData]);

  // Process geography data
  const geographyData = useMemo(() => {
    if (!audienceData?.geography) {
      console.log("❌ No geography data available");
      return [];
    }
    const data = audienceData.geography.slice(0, 8).map((geo) => ({
      name: geo.country,
      value: parseFloat(geo.percentage.toFixed(1)),
    }));
    console.log("✅ Geography data processed:", data);
    return data;
  }, [audienceData]);

  // Get username (use id or creatorId)
  const username =
    influencer?.id || influencer?.creatorId || influencer?.name || "INFLUENCER";

  // Calculate follower count and engagement rate from socialNetworks
  const followerCount = influencer?.followersCount || 0;
  const engagementRate = useMemo(() => {
    const socialNetworks = influencer?.platformInfo?.socialNetworks;
    if (
      !socialNetworks ||
      !Array.isArray(socialNetworks) ||
      socialNetworks.length === 0
    ) {
      return 0;
    }

    // Get engagement from the first available social network
    for (const sn of socialNetworks) {
      if (typeof sn.engagement === "number" && sn.engagement > 0) {
        return sn.engagement;
      }
    }

    return 0;
  }, [influencer]);

  // Get primary platform
  const primaryPlatform = influencer?.platform || "Instagram";

  return (
    <div
      data-squad-pdf-template
      style={{
        width: `${PDF_BRANDING.dimensions.a4Width}px`,
        height: `${PDF_BRANDING.dimensions.a4Height}px`,
        background: `linear-gradient(135deg, ${PDF_BRANDING.colors.primary} 0%, ${PDF_BRANDING.colors.secondary} 100%)`,
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
        padding: "30px",
        boxSizing: "border-box",
      }}
    >
      {/* White rounded container */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "24px",
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            height: "50px",
            background: `linear-gradient(135deg, ${PDF_BRANDING.colors.primary} 0%, ${PDF_BRANDING.colors.secondary} 100%)`,
            borderRadius: "24px 24px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
          }}
        >
          <div style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>
            SPARK
          </div>
          <div style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>
            INFLUENCERS
          </div>
          <div style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>
            WE ARE CATCH
          </div>
        </div>

        {/* Main Content Area - Grid Layout */}
        <div
          style={{
            padding: "30px 40px 50px 40px",
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "24px",
            flex: 1,
            alignItems: "start",
          }}
        >
          {/* Left Column - Profile Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Profile Photo - No white background */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
                paddingBottom: "4px",
              }}
            >
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  border: `6px solid ${PDF_BRANDING.colors.primary}`,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#E5E7EB",
                }}
              >
                {influencer?.avatar ? (
                  <img
                    src={influencer.avatar}
                    alt={influencer.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: "64px",
                      fontWeight: 700,
                      color: "#9CA3AF",
                    }}
                  >
                    {influencer?.name?.charAt(0) || "I"}
                  </div>
                )}
              </div>
            </div>

            {/* Name and Metrics */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "20px",
                paddingTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {/* Username */}
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: PDF_BRANDING.colors.primary,
                  margin: 0,
                  lineHeight: 1.2,
                  wordBreak: "break-word",
                }}
              >
                {username}
              </h2>

              {/* Description */}
              {audienceData?.bio && (
                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.3,
                    color: PDF_BRANDING.colors.text.secondary,
                    margin: 0,
                    textAlign: "left",
                  }}
                >
                  {audienceData?.bio}
                </p>
              )}

              {/* Metrics */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: PDF_BRANDING.colors.text.secondary,
                      fontWeight: 600,
                    }}
                  >
                    FW:
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: PDF_BRANDING.colors.text.primary,
                    }}
                  >
                    {formatNumber(followerCount)}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: PDF_BRANDING.colors.text.secondary,
                      fontWeight: 600,
                    }}
                  >
                    ER:
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: PDF_BRANDING.colors.text.primary,
                    }}
                  >
                    {engagementRate.toFixed(1)}%
                  </span>
                </div>

                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: PDF_BRANDING.colors.text.secondary,
                      fontWeight: 600,
                    }}
                  >
                    PLAT:
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: PDF_BRANDING.colors.primary,
                      textTransform: "uppercase",
                    }}
                  >
                    {primaryPlatform}
                  </span>
                </div>
              </div>
            </div>

            {/* Gender Distribution - Under followers */}
            {audienceData && genderData.length > 0 && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                {/* Smaller Donut Chart with Centered Percentage */}
                <div
                  style={{
                    position: "relative",
                    width: "140px",
                    height: "140px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                      >
                        {genderData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === 0
                                ? PDF_BRANDING.colors.primary
                                : PDF_BRANDING.colors.cyan
                            }
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Inline labels below chart */}
                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: PDF_BRANDING.colors.cyan,
                      }}
                    >
                      {genderData[1]?.value}%
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: PDF_BRANDING.colors.text.secondary,
                      }}
                    >
                      HOMBRES
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: PDF_BRANDING.colors.primary,
                      }}
                    >
                      {genderData[0]?.value}%
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: PDF_BRANDING.colors.text.secondary,
                      }}
                    >
                      MUJERES
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Charts */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              width: "100%",
            }}
          >
            {/* Age Distribution - Full width */}
            {audienceData && ageData.length > 0 && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  minHeight: "280px",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: PDF_BRANDING.colors.text.primary,
                    marginTop: 0,
                    marginBottom: "12px",
                  }}
                >
                  DISTRIBUCIÓN POR EDAD
                </h3>

                <div style={{ width: "100%", height: "220px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ageData}
                      margin={{ top: 10, right: 20, bottom: 20, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 11,
                          fill: PDF_BRANDING.colors.text.secondary,
                        }}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: PDF_BRANDING.colors.text.secondary,
                        }}
                        width={35}
                      />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar
                        dataKey="value"
                        fill={PDF_BRANDING.colors.cyan}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Geographic Distribution - Full Width */}
            {audienceData && geographyData.length > 0 && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  minHeight: "320px",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: PDF_BRANDING.colors.text.primary,
                    marginTop: 0,
                    marginBottom: "4px",
                  }}
                >
                  DISTRIBUCIÓN GEOGRÁFICA
                </h3>

                <div style={{ width: "100%", height: "280px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={geographyData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        type="number"
                        tick={{
                          fontSize: 11,
                          fill: PDF_BRANDING.colors.text.secondary,
                        }}
                        domain={[0, "dataMax"]}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={75}
                        tick={{
                          fontSize: 11,
                          fill: PDF_BRANDING.colors.text.secondary,
                        }}
                      />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar
                        dataKey="value"
                        fill={PDF_BRANDING.colors.primary}
                        radius={[0, 4, 4, 0]}
                        label={{
                          position: "right",
                          formatter: (value: number) => `${value}%`,
                          fontSize: 11,
                          fill: PDF_BRANDING.colors.text.secondary,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
