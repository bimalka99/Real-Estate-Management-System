using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Auth.Dtos;

namespace RealEstate.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommand : IRequest<AuthResponseDto>
{
    public Guid UserId { get; set; }

    public string RefreshToken { get; set; } = string.Empty;
}

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public RefreshTokenCommandHandler(IApplicationDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        var providedHash = _tokenService.HashRefreshToken(request.RefreshToken);

        if (user is null
            || user.RefreshTokenHash is null
            || user.RefreshTokenExpiresAtUtc is null
            || user.RefreshTokenExpiresAtUtc < DateTime.UtcNow
            || user.RefreshTokenHash != providedHash)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        var accessToken = _tokenService.GenerateAccessToken(user);

        // Rotate the refresh token on every use so a stolen-then-reused token is only valid once.
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        user.RefreshTokenHash = _tokenService.HashRefreshToken(newRefreshToken);
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(_tokenService.RefreshTokenExpiryDays);

        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResponseDto
        {
            AccessToken = accessToken.Token,
            AccessTokenExpiresAtUtc = accessToken.ExpiresAtUtc,
            RefreshToken = newRefreshToken,
            User = new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                AgencyId = user.AgencyId,
                IsEmailVerified = user.IsEmailVerified,
                TwoFactorEnabled = user.TwoFactorEnabled,
            },
        };
    }
}
