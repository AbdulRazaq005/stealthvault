using Microsoft.EntityFrameworkCore;
using StealthVault.Domain.Entities;

namespace StealthVault.Infrastructure
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Secret> Secrets { get; set; }
    }
}