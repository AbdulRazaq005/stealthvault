using FastEndpoints;
using StealthVault.Application.Interfaces;
using StealthVault.Application.TaskModels;

namespace StealthVault.Endpoints.Auth;

public class UpdatePassword(IAuthService authService, ICurrentUser currentUser)
    : Endpoint<UpdatePasswordRequest, BaseResponse>
{
    public override void Configure()
    {
        Post("/auth/update-password");
    }

    public override async Task HandleAsync(UpdatePasswordRequest req, CancellationToken ct)
    {
        var result = await authService.UpdatePasswordAsync(
            currentUser.UserId,
            new UpdatePasswordTaskModel
            {
                Password = req.Password,
                NewPassword = req.NewPassword,
                VaultKeyEncMaster = req.VaultKeyEncMaster,
            },
            ct);
        
        var response = new BaseResponse()
        {
            IsSuccess = result
        };
        await Send.OkAsync(response, ct);
    }
}