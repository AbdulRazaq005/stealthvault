using System.ComponentModel.DataAnnotations;
using FastEndpoints;
using FluentValidation;

namespace StealthVault.Endpoints.Auth;

public class UpdatePasswordRequest
{
    [Required]
    public string Password { get; set; } = null!;
    
    [Required]
    public string VaultKeyEncMaster { get; set; } = null!;
    
    [Required]
    public string VaultKeyEncRecovery { get; set; } = null!;
}

public class UpdatePasswordRequestValidator : Validator<UpdatePasswordRequest>
{
    public UpdatePasswordRequestValidator()
    {
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required");

        RuleFor(x => x).Custom((x, ctx) =>
        {
            if (string.IsNullOrWhiteSpace(x.VaultKeyEncMaster) && string.IsNullOrWhiteSpace(x.VaultKeyEncRecovery))
            {
                ctx.AddFailure("Both VaultKeyEncMaster and VaultKeyEncRecovery cannot be empty");
            }
        });
    }
}