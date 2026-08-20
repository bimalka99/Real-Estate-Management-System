using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Features.Auth.Commands.ConfirmTwoFactorSetup;
using RealEstate.Application.Features.Auth.Commands.DisableTwoFactor;
using RealEstate.Application.Features.Auth.Commands.ForgotPassword;
using RealEstate.Application.Features.Auth.Commands.InitiateTwoFactorSetup;
using RealEstate.Application.Features.Auth.Commands.Login;
using RealEstate.Application.Features.Auth.Commands.RefreshToken;
using RealEstate.Application.Features.Auth.Commands.Register;
using RealEstate.Application.Features.Auth.Commands.ResendVerificationEmail;
using RealEstate.Application.Features.Auth.Commands.ResetPassword;
using RealEstate.Application.Features.Auth.Commands.VerifyEmail;
using RealEstate.Application.Features.Auth.Commands.VerifyTwoFactor;
using RealEstate.Application.Features.Auth.Dtos;

namespace RealEstate.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Create a new Client or Agent account and receive an access + refresh token pair.
    /// Also sends an email-verification link — the account is usable immediately either way.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Exchange an email + password for an access + refresh token pair — or, if the
    /// account has two-factor authentication enabled, a short-lived challenge token to
    /// redeem at <c>POST /api/auth/2fa/verify</c> instead.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResultDto>> Login(LoginCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Exchange a still-valid refresh token for a new access + refresh token pair.
    /// The previous refresh token is invalidated (rotation).
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> Refresh(RefreshTokenCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Confirm an email address via the link sent at registration (or resend below).</summary>
    [HttpPost("verify-email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyEmail(VerifyEmailCommand command, CancellationToken cancellationToken)
    {
        await _sender.Send(command, cancellationToken);
        return Ok(new { message = "Email verified." });
    }

    /// <summary>Send a new verification link to the signed-in user's own email address.</summary>
    [HttpPost("resend-verification")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResendVerification(CancellationToken cancellationToken)
    {
        await _sender.Send(new ResendVerificationEmailCommand { RequestingUserId = GetCurrentUserId() }, cancellationToken);
        return Ok(new { message = "Verification email sent." });
    }

    /// <summary>
    /// Request a password reset link. Always responds the same way whether or not the
    /// email belongs to an account, to avoid leaking which emails are registered.
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordCommand command, CancellationToken cancellationToken)
    {
        await _sender.Send(command, cancellationToken);
        return Ok(new { message = "If an account exists for that email, a reset link has been sent." });
    }

    /// <summary>Complete a password reset using the token from the emailed link.</summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword(ResetPasswordCommand command, CancellationToken cancellationToken)
    {
        await _sender.Send(command, cancellationToken);
        return Ok(new { message = "Password reset. Please log in with your new password." });
    }

    /// <summary>Begin two-factor setup — returns a QR code to scan with an authenticator app.</summary>
    [HttpPost("2fa/setup")]
    [Authorize]
    [ProducesResponseType(typeof(TwoFactorSetupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TwoFactorSetupDto>> SetupTwoFactor(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new InitiateTwoFactorSetupCommand { RequestingUserId = GetCurrentUserId() }, cancellationToken);
        return Ok(result);
    }

    /// <summary>Confirm setup with a code from the authenticator app — enables 2FA and returns one-time recovery codes.</summary>
    [HttpPost("2fa/enable")]
    [Authorize]
    [ProducesResponseType(typeof(TwoFactorRecoveryCodesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TwoFactorRecoveryCodesDto>> EnableTwoFactor(ConfirmTwoFactorSetupCommand command, CancellationToken cancellationToken)
    {
        command.RequestingUserId = GetCurrentUserId();
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Turn two-factor authentication off. Requires the account password as confirmation.</summary>
    [HttpPost("2fa/disable")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DisableTwoFactor(DisableTwoFactorCommand command, CancellationToken cancellationToken)
    {
        command.RequestingUserId = GetCurrentUserId();
        await _sender.Send(command, cancellationToken);
        return Ok(new { message = "Two-factor authentication disabled." });
    }

    /// <summary>
    /// Redeem the challenge token from a 2FA-gated login with a TOTP or recovery code
    /// for the real access + refresh token pair.
    /// </summary>
    [HttpPost("2fa/verify")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> VerifyTwoFactor(VerifyTwoFactorCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
