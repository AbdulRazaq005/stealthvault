using FastEndpoints;
using StealthVault.Application.TaskModels;
using StealthVault.Application.Interfaces;
using StealthVault.Domain.Enums;

namespace StealthVault.Endpoints.Secrets;

public class DeleteSecrets(ISecretService service, ICurrentUser currentUser) 
    : Endpoint<DeleteSecretsRequest, BaseResponse>
{
    public override void Configure()
    {
        Delete("/secrets/{id:guid}");
        Roles(nameof(Enums.UserRole.User));
    }

    public override async Task HandleAsync(DeleteSecretsRequest req, CancellationToken ct)
    {
        var res = await service.DeleteSecretAsync(currentUser.UserId, req.Id, ct);

        await Send.OkAsync(new BaseResponse
        {
            IsSuccess = res
        }, ct);
    }
}