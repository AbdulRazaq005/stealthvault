using System.ComponentModel.DataAnnotations;

namespace StealthVault.Endpoints.Auth;

public class LoginRequest
{
    [Required]
    public string Username { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;
}