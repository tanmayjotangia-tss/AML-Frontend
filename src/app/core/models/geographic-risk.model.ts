export interface CreateGeographicRiskRequestDto {
  countryCode: string;
  countryName: string;
  fatfStatus: string;
  baselAmlIndexScore: number;
  riskTier: string;
  notes?: string;
  effectiveFrom: string;
}

export interface UpdateGeographicRiskRequestDto {
  countryName: string;
  fatfStatus: string;
  baselAmlIndexScore: number;
  riskTier: string;
  notes?: string;
  effectiveFrom: string;
}

export interface GeographicRiskRatingResponseDto {
  countryCode: string;
  countryName: string;
  fatfStatus: string;
  baselAmlIndexScore: number;
  riskTier: string;
  notes?: string;
  effectiveFrom: string;
  sysCreatedAt?: string;
  sysUpdatedAt?: string;
}
