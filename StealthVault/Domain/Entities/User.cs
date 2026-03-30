using System.ComponentModel.DataAnnotations;
using static StealthVault.Domain.Enums.Enums;

namespace StealthVault.Domain.Entities;

public class User : BaseEntity
{
    [Key]
    public Guid Id { get; init; } = Guid.NewGuid();

    [Required] 
    [MaxLength(100)] 
    public string Name { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = null!;

    [Required]
    [MaxLength(100)] 
    public string Email { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string PasswordHash { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string Salt { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string VaultKeyEncMaster { get; set; } = null!;
    
    [Required]
    [MaxLength(100)]
    public string VaultKeyEncRecovery { get; set; } = null!;

    [Required] public Enums.Enums.UserRole Role { get; set; } = Enums.Enums.UserRole.User;
}

