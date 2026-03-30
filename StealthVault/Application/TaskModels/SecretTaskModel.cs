using StealthVault.Domain.Enums;

namespace StealthVault.Application.TaskModels;

public class SecretTaskModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Ciphertext { get; set; } = null!;
    public Guid UserId { get; set; }
    public string Iv { get; set; } = null!;
    public Enums.SecretType Type { get; set; }
}