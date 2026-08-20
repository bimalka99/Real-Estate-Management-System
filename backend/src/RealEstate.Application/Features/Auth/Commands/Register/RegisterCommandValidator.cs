using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Auth.Commands.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator(IApplicationDbContext context)
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256)
            .MustAsync(async (email, cancellationToken) =>
            {
                var normalized = email.Trim().ToLowerInvariant();
                return !await context.Users.AnyAsync(u => u.Email == normalized, cancellationToken);
            })
            .WithMessage("An account with this email already exists.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters long.");

        RuleFor(x => x.Role)
            .Must(role => role is UserRole.Client or UserRole.Agent)
            .WithMessage("Self-registration is only available for Client or Agent accounts.");
    }
}
