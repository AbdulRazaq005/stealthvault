namespace StealthVault.Domain.Entities;

public abstract class BaseEntity
{
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastModifiedAt { get; set; } 
}