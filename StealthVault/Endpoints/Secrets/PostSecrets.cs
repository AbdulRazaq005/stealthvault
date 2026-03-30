using FastEndpoints;
using StealthVault.Application.Interfaces;
using StealthVault.Application.TaskModels;
using StealthVault.Domain.Enums;

namespace StealthVault.Endpoints.Secrets;

public class PostSecrets(ISecretService service, ICurrentUser currentUser) 
    : Endpoint<PostSecretsRequest, BaseResponse>
{
    public override void Configure()
    {
        Post("/secrets");
        Roles(nameof(Enums.UserRole.User));
    }

    public override async Task HandleAsync(PostSecretsRequest req, CancellationToken ct)
    {
        var res = await service.AddSecretAsync(new SecretTaskModel
        {
            Name = req.Name,
            Ciphertext = req.Ciphertext,
            Iv = req.Iv,
            UserId = currentUser.UserId,
            Type = req.Type,
        }, ct);

        await Send.OkAsync(new BaseResponse
        {
            IsSuccess = res
        }, ct);
    }
}