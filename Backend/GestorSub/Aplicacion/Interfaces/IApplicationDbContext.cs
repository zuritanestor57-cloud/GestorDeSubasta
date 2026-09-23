using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

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

        /// <summary>
        /// Abre una transacción explícita para agrupar varias operaciones (ej. liberación + retención de escrow)
        /// en un único bloque atómico, con rollback completo ante cualquier fallo (2.1, 2.3 y 3.1 ACID).
        /// </summary>
        Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    }
}
