namespace StealthVault.Application.TaskModels;

public class UpdatePasswordTaskModel
{
    public string Password { get; set; } = null!;
    public string VaultKeyEncMaster { get; set; } = null!;
    public string VaultKeyEncRecovery { get; set; } = null!;
}