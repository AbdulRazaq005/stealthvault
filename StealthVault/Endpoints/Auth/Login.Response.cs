namespace StealthVault.Endpoints.Auth;

public class LoginResponse : BaseResponse
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Token { get; set; } = null!;
    public string Salt { get; set; } = null!;
    public string VaultKeyEncMaster { get; set; } = null!;
}