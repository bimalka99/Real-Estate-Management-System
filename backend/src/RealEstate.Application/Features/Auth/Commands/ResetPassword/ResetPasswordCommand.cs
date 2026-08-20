using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Features.Auth.Commands.ResetPassword;

public class ResetPasswordCommand : IRequest<Unit>
{
    public Guid UserId { get; set; }

    public string Token { get; set; } = string.Empty;

    public string NewPassword { get; set; } = string.Empty;
}

public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters long.");
    }
}

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;

    public ResetPasswordCommandHandler(
        IApplicationDbContext context,
        ITokenService tokenService,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    public async Task<Unit> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        var providedHash = _tokenService.HashSecureToken(request.Token);

        if (user is null
            || user.PasswordResetTokenHash is null
            || user.PasswordResetTokenExpiresAtUtc is null
            || user.PasswordResetTokenExpiresAtUtc < DateTime.UtcNow
            || user.PasswordResetTokenHash != providedHash)
        {
            throw new BadRequestException("Invalid or expired reset link. Request a new one.");
        }

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiresAtUtc = null;

        // The password just changed — invalidate any existing session so a stolen-but-not-yet-
        // used refresh token (or anyone else still signed in) is forced to log in again.
        user.RefreshTokenHash = null;
        user.RefreshTokenExpiresAtUtc = null;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
