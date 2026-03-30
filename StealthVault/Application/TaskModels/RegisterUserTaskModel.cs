namespace StealthVault.Application.TaskModels;

public class RegisterUserTaskModel
{
    public string Name { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Salt { get; set; } = null!;
    public string VaultKeyEncMaster { get; set; } = null!;
    public string VaultKeyEncRecovery { get; set; } = null!;
}