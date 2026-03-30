namespace StealthVault.Endpoints;

public class BaseResponse
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
}