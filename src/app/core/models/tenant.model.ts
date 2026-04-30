export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEPROVISIONED = 'DEPROVISIONED'
}

export interface TenantResponseDto {
  id: string;
  tenantCode: string;
  schemaName: string;
  institutionName: string;
  countryCode: string;
  regulatoryJurisdiction?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  status: TenantStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTenantRequestDto {
  tenantCode: string;
  schemaName: string;
  institutionName: string;
  countryCode: string;
  regulatoryJurisdiction?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export interface UpdateTenantRequestDto {
  institutionName: string;
  countryCode: string;
  regulatoryJurisdiction?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  status: TenantStatus;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
