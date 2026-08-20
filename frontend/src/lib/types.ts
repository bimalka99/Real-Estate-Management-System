// Mirrors the DTOs / enums exposed by RealEstate.API (see backend/src/RealEstate.Domain/Enums
// and RealEstate.Application/Features/Properties/Dtos/PropertyDto.cs). Kept in sync by hand for
// now — if this drifts, regenerate from `/swagger/v1/swagger.json`.

export type PropertyType =
  | "Villa"
  | "Penthouse"
  | "Apartment"
  | "Estate"
  | "Townhouse"
  | "Land"
  | "Commercial";

export type ListingType = "Sale" | "Rent";

export type PropertyStatus =
  | "ForSale"
  | "ForRent"
  | "UnderOffer"
  | "Sold"
  | "OffMarket";

export interface PropertyImageDto {
  id: string;
  url: string;
  isCover: boolean;
  sortOrder: number;
}

export interface PropertyDto {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  currency: string;
  addressLine: string;
  city: string;
  state?: string | null;
  country: string;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  yearBuilt?: number | null;
  amenities: string[];
  isFeatured: boolean;
  virtualTourUrl?: string | null;
  agentId: string;
  agentName: string;
  agencyId?: string | null;
  agencyName?: string | null;
  images: PropertyImageDto[];
  createdAtUtc: string;
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type UserRole = "Client" | "Agent" | "AgencyAdmin" | "SuperAdmin";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  agencyId?: string | null;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  user: AuthUser;
}

/**
 * What POST /api/auth/login actually returns. When the account has 2FA enabled,
 * `auth` is absent and `twoFactorChallengeToken` must be redeemed at
 * POST /api/auth/2fa/verify (with a TOTP or recovery code) for real tokens.
 */
export interface LoginResult {
  requiresTwoFactor: boolean;
  twoFactorChallengeToken?: string;
  auth?: AuthResponse;
}

export interface TwoFactorSetup {
  manualEntryKey: string;
  otpAuthUri: string;
  /** Base64-encoded PNG — render as `data:image/png;base64,${qrCodeImageBase64}`. */
  qrCodeImageBase64: string;
}

export interface PropertyFilters {
  city?: string;
  type?: PropertyType;
  listingType?: ListingType;
  status?: PropertyStatus;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  isFeatured?: boolean;
  agentId?: string;
  agencyId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export type InquiryStatus = "New" | "Contacted" | "ViewingScheduled" | "Closed";

export interface InquiryDto {
  id: string;
  propertyId: string;
  propertyTitle: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  preferredViewingDate?: string | null;
  status: InquiryStatus;
  createdAtUtc: string;
}

export interface AgentDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  agencyId?: string | null;
  agencyName?: string | null;
  listingCount: number;
  averageRating?: number | null;
  reviewCount: number;
}

export interface ReviewDto {
  id: string;
  agentId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatarUrl?: string | null;
  rating: number;
  comment: string;
  createdAtUtc: string;
}

export interface AgencyDto {
  id: string;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  agentCount: number;
  listingCount: number;
}

export interface AgencyDetailDto extends AgencyDto {
  agents: AgentDto[];
}

export interface AdminUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  agencyName?: string | null;
  createdAtUtc: string;
}

export interface AdminStatsDto {
  totalUsers: number;
  totalAgents: number;
  totalClients: number;
  totalProperties: number;
  totalAgencies: number;
  totalInquiries: number;
  totalReviews: number;
}

export interface ContactMessageDto {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  isRead: boolean;
  createdAtUtc: string;
}

export type AgencyJoinRequestStatus = "Pending" | "Approved" | "Rejected";

export interface AgencyJoinRequestDto {
  id: string;
  agencyId: string;
  agencyName: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: AgencyJoinRequestStatus;
  createdAtUtc: string;
}
