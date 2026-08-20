import type {
  AdminStatsDto,
  AdminUserDto,
  AgencyDetailDto,
  AgencyDto,
  AgencyJoinRequestDto,
  AgentDto,
  AuthResponse,
  ContactMessageDto,
  InquiryDto,
  ListingType,
  LoginResult,
  PaginatedList,
  PropertyDto,
  PropertyFilters,
  PropertyImageDto,
  PropertyStatus,
  PropertyType,
  ReviewDto,
  TwoFactorSetup,
  UserRole,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5112";

/**
 * Thrown by apiFetch on a non-2xx response. Carries the backend's own error
 * shape (see RealEstate.API's ExceptionHandlingMiddleware: { title, status, errors? })
 * so callers — especially forms — can show the real validation/auth message
 * instead of a generic "request failed".
 */
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Thin fetch wrapper around the RealEstate.API backend. Server Components can
 * call these directly; results are revalidated periodically rather than
 * cached forever, since listings change.
 */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    let title = `Request failed (${res.status})`;
    let errors: Record<string, string[]> | undefined;
    try {
      const body = await res.json();
      if (typeof body?.title === "string") title = body.title;
      errors = body?.errors;
    } catch {
      // Response wasn't JSON — fall back to the generic message above.
    }
    throw new ApiError(res.status, title, errors);
  }

  // 204 No Content (e.g. favorite add/remove) has no body — don't attempt to parse it.
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

function buildQuery(filters: PropertyFilters = {}): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getProperties(
  filters: PropertyFilters = {},
): Promise<PaginatedList<PropertyDto>> {
  return apiFetch<PaginatedList<PropertyDto>>(`/api/properties${buildQuery(filters)}`);
}

export async function getFeaturedProperties(limit = 6): Promise<PropertyDto[]> {
  const result = await getProperties({ isFeatured: true, pageSize: limit });
  return result.items;
}

export async function getPropertyById(id: string): Promise<PropertyDto | null> {
  try {
    return await apiFetch<PropertyDto>(`/api/properties/${id}`);
  } catch {
    return null;
  }
}

export interface CreateInquiryInput {
  propertyId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  preferredViewingDate?: string;
}

/** Callable from both Server and Client Components — this is a mutation, so no caching applies. */
export async function createInquiry(input: CreateInquiryInput): Promise<string> {
  return apiFetch<string>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "Client" | "Agent";
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(email: string, password: string): Promise<LoginResult> {
  return apiFetch<LoginResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ---- Email verification ----

export async function verifyEmail(userId: string, token: string): Promise<void> {
  await apiFetch<void>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ userId, token }),
  });
}

export async function resendVerificationEmail(token: string): Promise<void> {
  await apiFetch<void>("/api/auth/resend-verification", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Password reset ----

/** Always resolves — the backend intentionally responds the same way whether or not the email exists. */
export async function forgotPassword(email: string): Promise<void> {
  await apiFetch<void>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(userId: string, token: string, newPassword: string): Promise<void> {
  await apiFetch<void>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ userId, token, newPassword }),
  });
}

// ---- Two-factor authentication (all require an access token — client-only) ----

export async function setupTwoFactor(token: string): Promise<TwoFactorSetup> {
  return apiFetch<TwoFactorSetup>("/api/auth/2fa/setup", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function enableTwoFactor(token: string, code: string): Promise<string[]> {
  const result = await apiFetch<{ recoveryCodes: string[] }>("/api/auth/2fa/enable", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ code }),
  });
  return result.recoveryCodes;
}

export async function disableTwoFactor(token: string, password: string): Promise<void> {
  await apiFetch<void>("/api/auth/2fa/disable", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ password }),
  });
}

/** Redeems the challenge token from a 2FA-gated login for real access + refresh tokens. */
export async function verifyTwoFactorLogin(challengeToken: string, code: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ challengeToken, code }),
  });
}

// ---- Favorites (all require an access token — client-only) ----

export async function getMyFavoriteIds(token: string): Promise<string[]> {
  return apiFetch<string[]>("/api/favorites/ids", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMyFavorites(token: string): Promise<PropertyDto[]> {
  return apiFetch<PropertyDto[]>("/api/favorites", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addFavorite(token: string, propertyId: string): Promise<void> {
  await apiFetch<void>(`/api/favorites/${propertyId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function removeFavorite(token: string, propertyId: string): Promise<void> {
  await apiFetch<void>(`/api/favorites/${propertyId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Agent dashboard (all require an access token — client-only) ----

export async function getMyInquiries(token: string): Promise<InquiryDto[]> {
  return apiFetch<InquiryDto[]>("/api/inquiries/mine", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  price: number;
  currency: string;
  addressLine: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  yearBuilt?: number;
  amenities: string[];
}

/** agentId in the request body is ignored by the backend — it's always derived from the token. */
export async function createProperty(token: string, input: CreatePropertyInput): Promise<string> {
  return apiFetch<string>("/api/properties", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export interface UpdatePropertyInput extends CreatePropertyInput {
  status: PropertyStatus;
  isFeatured: boolean;
}

/** Fails with a 403 (ApiError.status === 403) if the token's user doesn't own this listing. */
export async function updateProperty(
  token: string,
  propertyId: string,
  input: UpdatePropertyInput,
): Promise<void> {
  await apiFetch<void>(`/api/properties/${propertyId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

/** Fails with a 403 (ApiError.status === 403) if the token's user doesn't own this listing. */
export async function deleteProperty(token: string, propertyId: string): Promise<void> {
  await apiFetch<void>(`/api/properties/${propertyId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Property images ----

/**
 * Bypasses apiFetch — it forces a JSON Content-Type header, which would break a
 * multipart/form-data upload (the browser needs to set that header itself, with
 * the correct boundary, when the body is a FormData).
 */
export async function uploadPropertyImage(
  token: string,
  propertyId: string,
  file: File,
): Promise<PropertyImageDto> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/properties/${propertyId}/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    let title = `Upload failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.title === "string") title = body.title;
    } catch {
      // ignore — fall back to the generic message
    }
    throw new ApiError(res.status, title);
  }

  return res.json() as Promise<PropertyImageDto>;
}

export async function deletePropertyImage(token: string, propertyId: string, imageId: string): Promise<void> {
  await apiFetch<void>(`/api/properties/${propertyId}/images/${imageId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function setCoverImage(token: string, propertyId: string, imageId: string): Promise<void> {
  await apiFetch<void>(`/api/properties/${propertyId}/images/${imageId}/cover`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Agents (public — no token needed) ----

export async function getAgents(): Promise<AgentDto[]> {
  return apiFetch<AgentDto[]>("/api/agents");
}

export async function getAgentById(id: string): Promise<AgentDto | null> {
  try {
    return await apiFetch<AgentDto>(`/api/agents/${id}`);
  } catch {
    return null;
  }
}

// ---- Agencies ----

export async function getAgencies(): Promise<AgencyDto[]> {
  return apiFetch<AgencyDto[]>("/api/agencies");
}

export async function getAgencyById(id: string): Promise<AgencyDetailDto | null> {
  try {
    return await apiFetch<AgencyDetailDto>(`/api/agencies/${id}`);
  } catch {
    return null;
  }
}

export interface CreateAgencyInput {
  name: string;
  description?: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
}

export async function createAgency(token: string, input: CreateAgencyInput): Promise<string> {
  return apiFetch<string>("/api/agencies", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export async function updateAgency(token: string, agencyId: string, input: CreateAgencyInput): Promise<void> {
  await apiFetch<void>(`/api/agencies/${agencyId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

/** Requests to join — creates a Pending request for that agency's AgencyAdmin, not instant membership. */
export async function joinAgency(token: string, agencyId: string): Promise<void> {
  await apiFetch<void>(`/api/agencies/${agencyId}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function leaveAgency(token: string): Promise<void> {
  await apiFetch<void>("/api/agencies/leave", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** The caller's own currently-pending join request, or null if they don't have one. */
export async function getMyJoinRequest(token: string): Promise<AgencyJoinRequestDto | null> {
  const result = await apiFetch<AgencyJoinRequestDto | undefined>("/api/agencies/my-join-request", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return result ?? null;
}

/** Pending join requests for one agency — only that agency's AgencyAdmin (or a SuperAdmin) can call this. */
export async function getJoinRequestsForAgency(token: string, agencyId: string): Promise<AgencyJoinRequestDto[]> {
  return apiFetch<AgencyJoinRequestDto[]>(`/api/agencies/${agencyId}/join-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function approveJoinRequest(token: string, requestId: string): Promise<void> {
  await apiFetch<void>(`/api/agencies/join-requests/${requestId}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function rejectJoinRequest(token: string, requestId: string): Promise<void> {
  await apiFetch<void>(`/api/agencies/join-requests/${requestId}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Token refresh ----

/**
 * Agency creation/join/leave change the user's Role server-side, but a JWT's claims
 * are a frozen snapshot from when it was issued — the existing access token keeps
 * saying the old role until a new one is minted. Call this right after those actions
 * (see AuthContext.refreshSession) so the UI reflects the new role immediately
 * instead of requiring a full logout/login.
 */
export async function refreshAccessToken(userId: string, refreshToken: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ userId, refreshToken }),
  });
}

// ---- Reviews ----

export async function getReviewsForAgent(agentId: string): Promise<ReviewDto[]> {
  return apiFetch<ReviewDto[]>(`/api/agents/${agentId}/reviews`);
}

export async function createReview(
  token: string,
  agentId: string,
  input: { rating: number; comment: string },
): Promise<ReviewDto> {
  return apiFetch<ReviewDto>(`/api/agents/${agentId}/reviews`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export async function deleteReview(token: string, reviewId: string): Promise<void> {
  await apiFetch<void>(`/api/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Admin (all SuperAdmin-only, enforced server-side) ----

export async function getAdminStats(token: string): Promise<AdminStatsDto> {
  return apiFetch<AdminStatsDto>("/api/admin/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAdminUsers(token: string): Promise<AdminUserDto[]> {
  return apiFetch<AdminUserDto[]>("/api/admin/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateUserRole(token: string, userId: string, role: UserRole): Promise<void> {
  await apiFetch<void>(`/api/admin/users/${userId}/role`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role }),
  });
}

export async function banUser(token: string, userId: string): Promise<void> {
  await apiFetch<void>(`/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function setPropertyFeatured(token: string, propertyId: string, isFeatured: boolean): Promise<void> {
  await apiFetch<void>(`/api/admin/properties/${propertyId}/featured`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ isFeatured }),
  });
}

// ---- Contact (general "contact us" — see Inquiries for property-specific leads) ----

export interface CreateContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function createContactMessage(input: CreateContactMessageInput): Promise<string> {
  return apiFetch<string>("/api/contact", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getContactMessages(token: string): Promise<ContactMessageDto[]> {
  return apiFetch<ContactMessageDto[]>("/api/admin/contact-messages", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function markContactMessageRead(token: string, id: string): Promise<void> {
  await apiFetch<void>(`/api/admin/contact-messages/${id}/read`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
}
