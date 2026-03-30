using FastEndpoints;

namespace StealthVault.Endpoints;

public class TestEndpoint : EndpointWithoutRequest<string>
{
    public override void Configure()
    {
        Get("/test");
        AllowAnonymous();
    }

    public override Task<string> ExecuteAsync(CancellationToken ct)
    {
        return Task.FromResult("Reached endpoint.");
    }
}