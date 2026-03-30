using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using StealthVault.Domain.Enums;

namespace StealthVault.Endpoints.Secrets;

public class DeleteSecretsRequest
{
    [FromRoute]
    public Guid Id { get; set; }
}