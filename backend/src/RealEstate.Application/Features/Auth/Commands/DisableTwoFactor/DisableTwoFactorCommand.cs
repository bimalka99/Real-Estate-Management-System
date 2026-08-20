using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Features.Auth.Commands.DisableTwoFactor;

public class DisableTwoFactorCommand : IRequest<Unit>
{
    /// <summary>Set by the controller from the caller's JWT — never trusted from the request body.</summary>
    public Guid RequestingUserId { get; set; }

    /// <summary>
    /// Current password required to turn 2FA off — a hijacked bearer token alone
    /// shouldn't be able to weaken the account's protection.
    /// </summary>
    public string Password { get; set; } = string.Empty;
}

public class DisableTwoFactorCommandHandler : IRequestHandler<DisableTwoFactorCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public DisableTwoFactorCommandHandler(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<Unit> Handle(DisableTwoFactorCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.RecoveryCodes)
            .FirstOrDefaultAsync(u => u.Id == request.RequestingUserId, cancellationToken)
            ?? throw new BadRequestException("Account not found.");

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Incorrect password.");
        }

        if (!user.TwoFactorEnabled)
        {
            throw new BadRequestException("Two-factor authentication is not enabled.");
        }

        user.TwoFactorEnabled = false;
        user.TwoFactorSecretEncrypted = null;

        foreach (var code in user.RecoveryCodes)
        {
            _context.UserRecoveryCodes.Remove(code);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
