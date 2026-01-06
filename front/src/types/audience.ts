export interface AudienceDemographics {
  age: {
    "13-17": number;
    "18-24": number;
    "25-34": number;
    "35-44": number;
    "45-54": number;
    "55+": number;
  };
  gender: {
    male: number;
    female: number;
  };
  geography: Array<{
    country: string;
    country_code: string;
    percentage: number;
  }>;
  is_synthetic: boolean;
  bio?: string;
}

export interface AudienceResponse {
  success: boolean;
  audience: AudienceDemographics;
}
