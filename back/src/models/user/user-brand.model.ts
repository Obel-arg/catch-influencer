export interface UserBrand {
  id: string;
  user_id: string;
  brand_id: string;
  organization_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserBrandCreateDTO {
  user_id: string;
  brand_id: string;
  organization_id: string;
}

export interface UserBrandWithDetails extends UserBrand {
  brand_name: string;
  brand_logo_url?: string;
  brand_industry?: string;
}
