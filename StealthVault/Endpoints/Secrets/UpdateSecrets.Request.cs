using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using StealthVault.Domain.Enums;

namespace StealthVault.Endpoints.Secrets;

public class UpdateSecretsRequest
{
    [FromRoute(Name= "id")]
    public Guid Id { get; set; }
    [Required]
    public string Name { get; set; } = null!;
    [Required]
    public string Ciphertext { get; set; } = null!;
}