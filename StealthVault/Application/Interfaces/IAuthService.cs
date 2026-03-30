using StealthVault.Application.TaskModels;

namespace StealthVault.Application.Interfaces;

public interface IAuthService
{
    Task<bool> RegisterUserAsync(RegisterUserTaskModel model, CancellationToken cancellationToken = default);

    Task<(UserTaskModel?, bool)> LoginUserAsync(string username, string password,
        CancellationToken ct = default);

    Task<bool> UpdatePasswordAsync(Guid userId, UpdatePasswordTaskModel model, 
        CancellationToken ct = default);
}