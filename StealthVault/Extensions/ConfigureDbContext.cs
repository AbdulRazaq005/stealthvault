using Microsoft.EntityFrameworkCore;
using StealthVault.Domain.Constants;
using StealthVault.Infrastructure;

namespace StealthVault.Extensions;

public static class ConfigureDbContext
{
    public static void AddAppDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetValue<string>(Configurations.ConnectionString);
        // Can be pulled from app settings in future
        var serverVersion = new MySqlServerVersion(new Version(9, 0, 1));

        services.AddDbContext<AppDbContext>(
            dbContextOptions => dbContextOptions
                .UseMySql(connectionString, serverVersion)
                // Below lines are only for debugging, should be disabled for Production.
                // .LogTo(Console.WriteLine, LogLevel.Information)
                // .EnableSensitiveDataLogging()
                // .EnableDetailedErrors()
        );
        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
    }
}