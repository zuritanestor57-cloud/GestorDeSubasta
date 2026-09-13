using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace Infraestructura
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
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
        }
    }
}
