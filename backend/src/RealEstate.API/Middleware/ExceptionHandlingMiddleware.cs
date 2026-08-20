using System.Net;
using System.Text.Json;
using BadRequestException = RealEstate.Application.Common.Exceptions.BadRequestException;
using ForbiddenAccessException = RealEstate.Application.Common.Exceptions.ForbiddenAccessException;
using ValidationException = RealEstate.Application.Common.Exceptions.ValidationException;

namespace RealEstate.API.Middleware;

/// <summary>
/// Central place that turns exceptions bubbling up from MediatR handlers into
/// consistent JSON error responses instead of leaking stack traces to clients.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                title = "One or more validation errors occurred.",
                status = context.Response.StatusCode,
                errors = ex.Errors
            }));
        }
        catch (UnauthorizedAccessException ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                title = ex.Message,
                status = context.Response.StatusCode
            }));
        }
        catch (ForbiddenAccessException ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                title = ex.Message,
                status = context.Response.StatusCode
            }));
        }
        catch (BadRequestException ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                title = ex.Message,
                status = context.Response.StatusCode
            }));
        }
        catch (KeyNotFoundException ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                title = ex.Message,
                status = context.Response.StatusCode
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception while processing {Method} {Path}", context.Request.Method, context.Request.Path);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                title = "An unexpected error occurred.",
                status = context.Response.StatusCode
            }));
        }
    }
}
