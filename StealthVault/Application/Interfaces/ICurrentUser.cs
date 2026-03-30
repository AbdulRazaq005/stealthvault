using StealthVault.Domain.Enums;

namespace StealthVault.Application.Interfaces;

public interface ICurrentUser
{
    Guid UserId { get; }
    string Name { get; }
    Enums.UserRole Role { get; }
    bool IsAuthenticated { get; }
}