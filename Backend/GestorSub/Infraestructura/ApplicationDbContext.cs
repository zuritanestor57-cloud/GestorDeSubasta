using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Aplicacion.Interfaces;

namespace Infraestructura
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
            => Database.BeginTransactionAsync(cancellationToken);

        public DbSet<User> Users { get; set; }
        public DbSet<Auction> Auctions { get; set; }
        public DbSet<Bid> Bids { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User ↔ Wallet (1:1)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Wallet)
                .WithOne(w => w.User)
                .HasForeignKey<Wallet>(w => w.UserId);

            // User ↔ Auction (1:N)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Auctions)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.UserId);

            // User ↔ Bid (1:N)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Bids)
                .WithOne(b => b.User)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict); // evita cascada doble

            // User ↔ AuditLog (1:N)
            modelBuilder.Entity<User>()
                .HasMany(u => u.AuditLogs)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.UserId);

            // Wallet ↔ Transaction (1:N)
            modelBuilder.Entity<Wallet>()
                .HasMany(w => w.Transactions)
                .WithOne(t => t.Wallet)
                .HasForeignKey(t => t.WalletId);

            /// Auction ↔ Bid (1:N)
            modelBuilder.Entity<Auction>()
                .HasMany(a => a.Bids)
                .WithOne(b => b.Auction)
                .HasForeignKey(b => b.AuctionId)
                .OnDelete(DeleteBehavior.Cascade); // mantiene cascada desde Auction

            // Auction ↔ Category (N:N)
            modelBuilder.Entity<Auction>()
                .HasMany(a => a.Categories)
                .WithMany(c => c.Auctions);

            // Auction ↔ Product (1:1)
            modelBuilder.Entity<Auction>()
                .HasOne(a => a.Product)
                .WithOne(p => p.Auction)
                .HasForeignKey<Product>("AuctionId");

            // Optimistic Locking (3.1): Version se usa como token de concurrencia real.
            // EF incluye "WHERE Version = @original" en cada UPDATE; si otra transacción
            // ya incrementó Version, la actualización afecta 0 filas y EF lanza
            // DbUpdateConcurrencyException, que los servicios traducen a 409 Conflict.
            modelBuilder.Entity<Auction>()
                .Property(a => a.Version)
                .IsConcurrencyToken();

            modelBuilder.Entity<Wallet>()
                .Property(w => w.Version)
                .IsConcurrencyToken();
        }
    }
}
