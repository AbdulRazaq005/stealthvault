using System.Security.Claims;
using StealthVault.Application.Interfaces;
using StealthVault.Domain.Enums;

namespace StealthVault.Application.Services;

public class CurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated =>
        User?.Identity?.IsAuthenticated ?? false;

    public Guid UserId
    {
        get
        {
            var id = User?.FindFirst("userId")?.Value;
            return id != null ? Guid.Parse(id) : Guid.Empty;
        }
    }

    public string Name =>
        User?.FindFirst("name")?.Value ?? string.Empty;

    public Enums.UserRole Role 
    {
        get
        {
            var role = User?.FindFirst("role")?.Value;
            if (role == null) return default;
            
            _ = Enum.TryParse<Enums.UserRole>(role, out var result);
            return result;
        }
    }
}