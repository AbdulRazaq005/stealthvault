using FastEndpoints;
using StealthVault.Application.Interfaces;
using StealthVault.Application.TaskModels;
using StealthVault.Domain.Enums;

namespace StealthVault.Endpoints.Secrets;

public class GetSecretsEndpoint(ISecretService service, ICurrentUser currentUser) : 
    EndpointWithoutRequest<List<SecretTaskModel>>
{
    public override void Configure()
    {
        Get("/secrets");
        Roles(nameof(Enums.UserRole.User));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var secrets = await service.GetSecretsAsync(
            currentUser.UserId, ct);

        await Send.OkAsync(secrets, cancellation: ct);
    }
}