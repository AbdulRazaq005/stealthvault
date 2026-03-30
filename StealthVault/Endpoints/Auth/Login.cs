using FastEndpoints;
using StealthVault.Application.Interfaces;

namespace StealthVault.Endpoints.Auth;

public class Login(IAuthService authService) : Endpoint<LoginRequest, LoginResponse>
{
    public override void Configure()
    {
        Post("/auth/login");
        AllowAnonymous();
    }

    public override async Task HandleAsync(LoginRequest req, CancellationToken ct)
    {
        var (user, result) = await authService.LoginUserAsync(
            req.Username,
            req.Password,
            ct);

        if (!result || user == null)
        {
            await Send.OkAsync(new LoginResponse()
            {
                ErrorMessage = "Username or password is incorrect",
                IsSuccess = result
            }, ct);
            return;
        }
        
        var response = new LoginResponse()
        {
            UserId = user.UserId,
            Name = user.Name,
            Username = user.Username,
            Email = user.Email,
            Token = user.Token,
            Salt = user.Salt,
            VaultKeyEncMaster = user.VaultKeyEncMaster,
            IsSuccess = result,
            ErrorMessage = result ? null : "Invalid username or password"
        };
        await Send.OkAsync(response, ct);
    }
}