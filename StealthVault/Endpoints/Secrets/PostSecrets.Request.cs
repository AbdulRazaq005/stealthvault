using System.ComponentModel.DataAnnotations;
using StealthVault.Domain.Enums;

namespace StealthVault.Endpoints.Secrets;

public class PostSecretsRequest
{
    [Required]
    public string Name { get; set; } = null!;
    [Required]
    public string Ciphertext { get; set; } = null!;
    [Required]
    public string Iv { get; set; } = null!;
    public Enums.SecretType Type { get; set; }
}