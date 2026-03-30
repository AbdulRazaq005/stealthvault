using StealthVault.Application.TaskModels;

namespace StealthVault.Application.Interfaces;

public interface ISecretService
{
    Task<bool> AddSecretAsync(SecretTaskModel model, CancellationToken ct = default);
    Task<List<SecretTaskModel>> GetSecretsAsync(Guid userId, CancellationToken ct = default);
    Task<bool> UpdateSecretAsync(SecretTaskModel model,  CancellationToken ct = default);
    Task<bool> DeleteSecretAsync(Guid userId, Guid secretId, CancellationToken ct = default);
}