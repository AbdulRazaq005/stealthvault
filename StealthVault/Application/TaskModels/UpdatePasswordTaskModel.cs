namespace StealthVault.Application.TaskModels;

public class UpdatePasswordTaskModel
{
    public string Password { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
    public string VaultKeyEncMaster { get; set; } = null!;
}