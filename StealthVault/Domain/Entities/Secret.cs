using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace StealthVault.Domain.Entities;

public class Secret : BaseEntity
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Ciphertext { get; set; } = null!;
    public string Iv { get; set; } = null!;
    public Enums.Enums.SecretType Type { get; set; }
}