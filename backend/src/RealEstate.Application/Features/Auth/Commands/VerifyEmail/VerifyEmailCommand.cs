using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Features.Auth.Commands.VerifyEmail;

public class VerifyEmailCommand : IRequest<Unit>
{
    public Guid UserId { get; set; }

    public string Token { get; set; } = string.Empty;
}

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public VerifyEmailCommandHandler(IApplicationDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<Unit> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        var providedHash = _tokenService.HashSecureToken(request.Token);

        // Deliberately not short-circuited by "already verified" — the token must still
        // match. Otherwise, once an account is verified, ANY token (including garbage)
        // would return success for its user id, which is both a sloppy contract and a
        // (low-value but real) way to probe whether a given user id is verified.
        if (user is null
            || user.EmailVerificationTokenHash is null
            || user.EmailVerificationTokenExpiresAtUtc is null
            || user.EmailVerificationTokenExpiresAtUtc < DateTime.UtcNow
            || user.EmailVerificationTokenHash != providedHash)
        {
            throw new BadRequestException("Invalid or expired verification link. Request a new one from your account settings.");
        }

        // Not cleared on success (unlike refresh/reset tokens) — this one is meant to
        // stay valid for repeat clicks of the same emailed link within its 24h window;
        // re-verifying an already-verified account is a harmless no-op either way.
        user.IsEmailVerified = true;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
