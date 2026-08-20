namespace RealEstate.Application.Common.Exceptions;

/// <summary>
/// Thrown when an authenticated user is recognized but isn't allowed to act on
/// a specific resource (e.g. editing another agent's listing) — distinct from
/// <see cref="UnauthorizedAccessException"/>, which means "not authenticated at all".
/// Maps to 403 Forbidden, not 401.
/// </summary>
public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException(string message) : base(message)
    {
    }
}
