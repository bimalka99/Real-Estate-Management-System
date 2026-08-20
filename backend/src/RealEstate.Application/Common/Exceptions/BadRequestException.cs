namespace RealEstate.Application.Common.Exceptions;

/// <summary>
/// Thrown when a request is well-formed but rejected because of the caller's/resource's
/// current state (an expired or already-used token, 2FA already enabled, wrong TOTP code,
/// etc.) — not a validation-rule failure (see <see cref="ValidationException"/>) and not an
/// auth failure. Maps to 400 Bad Request.
/// </summary>
public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message)
    {
    }
}
