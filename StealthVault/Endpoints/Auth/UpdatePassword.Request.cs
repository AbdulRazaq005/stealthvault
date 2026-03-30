using System.ComponentModel.DataAnnotations;
using FastEndpoints;
using FluentValidation;

namespace StealthVault.Endpoints.Auth;

public class UpdatePasswordRequest
{
    [Required]
    public string Password { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
    public string VaultKeyEncMaster { get; set; } = null!;
}

public class UpdatePasswordRequestValidator : Validator<UpdatePasswordRequest>
{
    public UpdatePasswordRequestValidator()
    {
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Current Login Password is required");

        RuleFor(x => x).Custom((x, ctx) =>
        {
            if (string.IsNullOrWhiteSpace(x.VaultKeyEncMaster) && string.IsNullOrWhiteSpace(x.NewPassword))
            {
                ctx.AddFailure("Both VaultKeyEncMaster and NewPassword cannot be empty");
            }
        });
    }
}