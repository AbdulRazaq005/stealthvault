using Microsoft.EntityFrameworkCore;
using StealthVault.Domain.Entities;

namespace StealthVault.Infrastructure
{
    public interface IAppDbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Secret> Secrets { get; set; }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}