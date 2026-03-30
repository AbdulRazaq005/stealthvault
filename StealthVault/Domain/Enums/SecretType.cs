namespace StealthVault.Domain.Enums;

public static partial class Enums
{
    public enum SecretType
    {
        None = 0,
        Credentials = 1,
        ApiKey = 2,
        Note = 3,
    }
}