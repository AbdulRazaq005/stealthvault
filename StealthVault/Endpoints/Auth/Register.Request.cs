using System.ComponentModel.DataAnnotations;
using FastEndpoints;
using FluentValidation;

namespace StealthVault.Endpoints.Auth;

public class RegisterRequest
{
    public string Name { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Email { get; set; } = null!;
    
    [Required]
    public string Salt { get; set; } = null!;
    
    [Required]
    public string VaultKeyEncMaster { get; set; } = null!;
    
    [Required]
    public string VaultKeyEncRecovery { get; set; } = null!;
    
}

public class RegisterUserValidator : Validator<RegisterRequest>
{
    public RegisterUserValidator(IConfiguration configuration)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(50).WithMessage("Name cannot exceed 50 characters");
        
        RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username is required")
                .MaximumLength(50).WithMessage("Username cannot exceed 50 characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");
    }
}