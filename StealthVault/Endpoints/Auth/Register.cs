using FastEndpoints;
using StealthVault.Application.Interfaces;
using StealthVault.Application.TaskModels;

namespace StealthVault.Endpoints.Auth;

public class Register(IAuthService authService) : Endpoint<RegisterRequest, BaseResponse>
{
    public override void Configure()
    {
        Post("/auth/register");
        AllowAnonymous();
    }

    public override async Task HandleAsync(RegisterRequest req, CancellationToken ct)
    {
        var result = await authService.RegisterUserAsync(new RegisterUserTaskModel()
        {
            Name = req.Name,
            Username = req.Username,
            Email = req.Email,
            Password = req.Password,
            Salt = req.Salt,
            VaultKeyEncMaster = req.VaultKeyEncMaster,
            VaultKeyEncRecovery = req.VaultKeyEncRecovery,
        }, ct);
        
        var response = new BaseResponse()
        {
            IsSuccess = result
        };
        await Send.OkAsync(response, ct);
    }
}