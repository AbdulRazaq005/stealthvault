using StealthVault.Application.Interfaces;
using StealthVault.Application.Services;

namespace StealthVault.Extensions;

public static class ConfigureServices
{
    public static void AddApplicationServices(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ISecretService, SecretService>();
    }
}