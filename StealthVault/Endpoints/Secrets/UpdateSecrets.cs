using FastEndpoints;
using StealthVault.Application.Interfaces;
using StealthVault.Application.TaskModels;
using StealthVault.Domain.Enums;

namespace StealthVault.Endpoints.Secrets;

public class UpdateSecrets(ISecretService service, ICurrentUser currentUser) 
    : Endpoint<UpdateSecretsRequest, BaseResponse>
{
    public override void Configure()
    {
        Put("/secrets/{id:guid}");
        Roles(nameof(Enums.UserRole.User));
    }

    public override async Task HandleAsync(UpdateSecretsRequest req, CancellationToken ct)
    {
        var res = await service.UpdateSecretAsync(new SecretTaskModel
        {
            Id = req.Id,
            Name = req.Name,
            Ciphertext = req.Ciphertext,
            UserId = currentUser.UserId,
            Iv = req.Iv,
        }, ct);

        await Send.OkAsync(new BaseResponse
        {
            IsSuccess = res
        }, ct);
    }
}