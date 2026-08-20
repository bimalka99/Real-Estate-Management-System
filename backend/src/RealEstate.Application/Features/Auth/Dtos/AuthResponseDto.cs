using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Auth.Dtos;

public class UserDto
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public Guid? AgencyId { get; set; }

    public bool IsEmailVerified { get; set; }

    public bool TwoFactorEnabled { get; set; }
}

public class AuthResponseDto
{
    public string AccessToken { get; set; } = string.Empty;

    public DateTime AccessTokenExpiresAtUtc { get; set; }

    public string RefreshToken { get; set; } = string.Empty;

    public UserDto User { get; set; } = null!;
}

/// <summary>
/// What <c>POST /api/auth/login</c> actually returns now. When the account has 2FA
/// enabled, <see cref="Auth"/> is null and the caller must redeem <see cref="TwoFactorChallengeToken"/>
/// at <c>POST /api/auth/2fa/verify</c> (with a TOTP or recovery code) to get real tokens.
/// </summary>
public class LoginResultDto
{
    public bool RequiresTwoFactor { get; set; }

    public string? TwoFactorChallengeToken { get; set; }

    public AuthResponseDto? Auth { get; set; }
}
