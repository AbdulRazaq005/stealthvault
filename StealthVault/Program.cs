using FastEndpoints;
using FastEndpoints.Security;
using FastEndpoints.Swagger;
using Microsoft.EntityFrameworkCore;
using StealthVault.Extensions;
using StealthVault.Infrastructure;

var builder = WebApplication.CreateBuilder();
builder.Services.AddAuthenticationJwtBearer(s => 
    s.SigningKey = builder.Configuration.GetValue<string>("JWTSecretKey"));
builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy("cors", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
builder.Services.AddFastEndpoints();
builder.Services.AddAppDbContext(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.SwaggerDocument(); 

var app = builder.Build();

using var serviceScope = app.Services.CreateScope();
using var dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>();
dbContext?.Database.Migrate();

app.UseAuthentication();
app.UseAuthorization();
app.UseCors("cors");
app.UseFastEndpoints();
app.UseSwaggerGen();
app.Run();