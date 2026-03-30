using Microsoft.EntityFrameworkCore;
using StealthVault.Application.Interfaces;
using StealthVault.Application.TaskModels;
using StealthVault.Domain.Entities;
using StealthVault.Infrastructure;

namespace StealthVault.Application.Services;

public class SecretService(IAppDbContext appDbContext) : ISecretService
{
    public async Task<bool> AddSecretAsync(SecretTaskModel model, CancellationToken ct = default)
    {
        var secret = new Secret
        {
            Name = model.Name,
            Ciphertext = model.Ciphertext,
            UserId = model.UserId,
            Iv = model.Iv,
            Type = model.Type,
        };
        
        await appDbContext.Secrets.AddAsync(secret, ct);
        return await appDbContext.SaveChangesAsync(ct) > 0;
    }

    public async Task<List<SecretTaskModel>> GetSecretsAsync(Guid userId,  CancellationToken ct = default)
    {
        return await appDbContext.Secrets
            .AsNoTracking()
            .Where(s => !s.IsDeleted && s.UserId == userId)
            .Select(s => new SecretTaskModel
            {
                Id = s.Id,
                Name = s.Name,
                Ciphertext = s.Ciphertext,
                UserId = s.UserId,
                Iv = s.Iv,
                Type = s.Type
            })
            .ToListAsync(ct);
    }
    
    public async Task<bool> UpdateSecretAsync(SecretTaskModel model,  CancellationToken ct = default)
    {
        var secret = await appDbContext.Secrets
            .SingleOrDefaultAsync(s => !s.IsDeleted && s.Id == model.Id && s.UserId == model.UserId, ct);

        if (secret == null)
            return false;

        secret.Name = model.Name;
        secret.Ciphertext = model.Ciphertext;
        secret.Iv = model.Iv;
        return await appDbContext.SaveChangesAsync(ct) > 0;
    }

    public async Task<bool> DeleteSecretAsync(Guid userId, Guid secretId,  CancellationToken ct = default)
    {
        var secret = await appDbContext.Secrets
            .SingleOrDefaultAsync(s => !s.IsDeleted && s.Id == secretId && s.UserId == userId, ct);

        if (secret == null)
            return false;

        secret.IsDeleted = true;
        return await appDbContext.SaveChangesAsync(ct) > 0;
    }
}