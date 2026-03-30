using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StealthVault.Application.Interfaces;
using StealthVault.Application.TaskModels;
using StealthVault.Domain.Entities;
using StealthVault.Domain.Enums;
using StealthVault.Infrastructure;

namespace StealthVault.Application.Services;

public class AuthService(IAppDbContext appDbContext, IConfiguration configuration) : IAuthService
{
    public async Task<bool> RegisterUserAsync(RegisterUserTaskModel model, CancellationToken ct = default)
    {
        var passHash = BCrypt.Net.BCrypt.HashPassword(model.Password);
        var user = new User()
        {
            Name = model.Name,
            Username = model.Username,
            PasswordHash = passHash,
            Email = model.Email,
            Salt = model.Salt,
            VaultKeyEncMaster = model.VaultKeyEncMaster,
            VaultKeyEncRecovery = model.VaultKeyEncRecovery
        };

        appDbContext.Users.Add(user);
        
        var result =await appDbContext.SaveChangesAsync(ct);
        return result > 0;
    }
    
    public async Task<(UserTaskModel?, bool)> LoginUserAsync(string username, string password,
        CancellationToken ct = default)
    {
        var user = await appDbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.Username == username && !u.IsDeleted, ct);
        
        var isValid = user != null && BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        if (!isValid)
        {
            return default;
        }
        
        var token = GenerateToken(user!.Id, user.Role, user.Name);
        return (new UserTaskModel
        {
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Username = user.Username,
            Token = token,
            Salt = user.Salt,
            VaultKeyEncMaster = user.VaultKeyEncMaster,
        }, true);
    }

    private string GenerateToken(Guid userId, Enums.UserRole role, string name)
    {
        var jwtSecret = configuration["JWTSecretKey"] 
                        ?? throw new Exception("JWT secret not configured.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var tokenExpiryInMins = Convert.ToInt32(configuration["TokenExpiryInMins"]);
        if (tokenExpiryInMins <= 0)
            throw new Exception("JWT expiry not configured.");

        var claims = new[]
        {
            new Claim("userId", userId.ToString()),
            new Claim("role", role.ToString()),
            new Claim("name", name)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(tokenExpiryInMins),
            signingCredentials: credentials
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        return tokenString;
    }
    
    public async Task<bool> UpdatePasswordAsync(Guid userId, UpdatePasswordTaskModel model, 
        CancellationToken ct = default)
    {
        var user = await appDbContext.Users.SingleOrDefaultAsync(u => 
            !u.IsDeleted && userId == u.Id, ct);
        
        var isValid = BCrypt.Net.BCrypt.Verify(model.Password, user?.PasswordHash);
        if (!isValid || string.IsNullOrWhiteSpace(model.Password) || user == null) return false;

        if (!string.IsNullOrWhiteSpace(model.VaultKeyEncMaster))
        {
            user.VaultKeyEncMaster = model.VaultKeyEncMaster;
        }
        if (!string.IsNullOrWhiteSpace(model.NewPassword))
        {
            var passHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
            user.PasswordHash = passHash;
        }
        
        user.LastModifiedAt = DateTime.UtcNow;
        return await appDbContext.SaveChangesAsync(ct) > 0;
    }
}