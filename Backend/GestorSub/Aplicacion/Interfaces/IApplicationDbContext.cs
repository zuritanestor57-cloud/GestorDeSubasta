using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aplicacion.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<User> Users { get; set; }
        DbSet<Auction> Auctions { get; set; }
        DbSet<Bid> Bids { get; set; }
        DbSet<Category> Categories { get; set; }
        DbSet<Product> Products { get; set; }
        DbSet<Transaction> Transactions { get; set; }
        DbSet<Wallet> Wallets { get; set; }
        DbSet<AuditLog> AuditLogs { get; set; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        int SaveChanges();
    }
}
