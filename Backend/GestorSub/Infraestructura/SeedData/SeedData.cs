using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.ConstrainedExecution;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infraestructura.SeedData
{
    public class SeedData
    {
        public static void Initialize(ApplicationDbContext context)
        {
            if (context.Users.Any())
            {
                return;
            }
            DateTime now = DateTime.Now;

            var seller1 = new User
            {
                Name = "Vendedor",
                Email = "vendedor@test.com",
                Password = "123",
                Role = UserRole.Seller,
            };
            var buyer1 = new User
            {
                Name = "Comprador1",
                Email = "comprador1@test.com",
                Password = "123",
                Role = UserRole.Buyer,
            };
            var buyer2 = new User
            {
                Name = "Comprador2",
                Email = "comprador2@test.com",
                Password = "123",
                Role = UserRole.Buyer
            };
            var buyer3 = new User
            {
                Name = "Comprador sin saldo",
                Email = "sinfondos@test.com",
                Password = "123",
                Role = UserRole.Buyer,
            };

            context.Users.AddRange(seller1, buyer1, buyer2, buyer3);
            context.SaveChanges();

            var walletSeller1 = new Wallet
            {
                UserId = seller1.Id,
                TotalBalance = 0,
                HeldBalance = 0,
                AvailableBalance = 0,
                Version = 1,
            };
            var walletBuyer1 = new Wallet
            {
                UserId = buyer1.Id,
                TotalBalance = 150000m,
                HeldBalance = 45000m,
                AvailableBalance = 105000m,
                Version = 1,
            };
            var walletBuyer2 = new Wallet
            {
                UserId = buyer2.Id,
                TotalBalance = 200000m,
                HeldBalance = 0,
                AvailableBalance = 200000m,
                Version = 1,
            };
            var walletBuyer3 = new Wallet
            {
                UserId = buyer3.Id,
                TotalBalance = 500m,
                HeldBalance = 0,
                AvailableBalance = 500m,
                Version = 1,
            };

            context.Wallets.AddRange(walletSeller1, walletBuyer1, walletBuyer2, walletBuyer3);
            context.SaveChanges();

            // Transacciones en el libro mayor (Ledger) que respaldan depósitos y retenciones
            var txDepositBuyer1 = new Transaction
            {
                WalletId = walletBuyer1.Id,
                Type = TransactionType.Deposit,
                Amount = 150000m,
                CreatedAt = now.AddHours(-3)
            };
            var txDepositBuyer2 = new Transaction
            {
                WalletId = walletBuyer2.Id,
                Type = TransactionType.Deposit,
                Amount = 200000m,
                CreatedAt = now.AddHours(-3)
            };
            var txDepositBuyer3 = new Transaction
            {
                WalletId = walletBuyer3.Id,
                Type = TransactionType.Deposit,
                Amount = 500m,
                CreatedAt = now.AddHours(-3)
            };

            context.Transactions.AddRange(txDepositBuyer1, txDepositBuyer2, txDepositBuyer3);
            context.SaveChanges();

            var Technology = new Category
            {
                Name = "Tecnologia",
            };
            var Collectibles = new Category
            {
                Name = "Coleccionables",
            };
            var Apparel = new Category
            {
                Name = "Indumentaria",
            };
            var Vehicles = new Category
            {
                Name = "Vehiculos",
            };
            context.Categories.AddRange(Technology, Collectibles, Apparel, Vehicles);
            context.SaveChanges();

            // 1. Subasta Activa (con 2 ofertas previas y mayor puja de $45.000 de buyer1 retenida)
            var Activeauction = new Auction
            {
                Status = AuctionStatus.Published,
                BasePrice = 30000m,
                CurrentBid = 45000m,
                MinimumIncrement = 5000m,
                StartDate = now.AddHours(-1),
                EndDate = now.AddMinutes(25),
                UserId = seller1.Id,
                Version = 1
            };
            var Activeproduct = new Product
            {
                Title = "Notebook",
                Description = "Notebook de prueba para la subasta activa.",
                ImageUrl = "https://example.com/notebook.jpg",
                Auction = Activeauction,
            };
            Activeauction.Product = Activeproduct;
            Activeauction.Categories = new List<Category> { Technology };

            var Activebid1 = new Bid
            {
                Amount = 40000m,
                CreatedAt = now.AddMinutes(-20),
                UserId = buyer2.Id,
                Auction = Activeauction,
            };

            var Activebid2 = new Bid
            {
                Amount = 45000m,
                CreatedAt = now.AddMinutes(-5),
                UserId = buyer1.Id,
                Auction = Activeauction,
            };

            Activeauction.Bids = new List<Bid> { Activebid1, Activebid2 };

            // 2. Subasta Crítica (por finalizar en 90 segundos)
            var Criticalauction = new Auction
            {
                Status = AuctionStatus.Published,
                BasePrice = 50000m,
                CurrentBid = 60000m,
                MinimumIncrement = 5000m,
                StartDate = now.AddHours(-2),
                EndDate = now.AddSeconds(90),
                UserId = seller1.Id,
                Version = 1
            };
            var Criticalproduct = new Product
            {
                Title = "Jarron de coleccion",
                Description = "Jarron de coleccion para probar la subasta crítica.",
                ImageUrl = "https://example.com/jarron.jpg",
                Auction = Criticalauction,
            };
            Criticalauction.Product = Criticalproduct;
            Criticalauction.Categories = new List<Category> { Collectibles };

            var Criticalbid = new Bid
            {
                Amount = 60000m,
                CreatedAt = now.AddMinutes(-1),
                UserId = buyer2.Id,
                Auction = Criticalauction,
            };

            Criticalauction.Bids = new List<Bid> { Criticalbid };

            // 3. Subasta Próxima (Inicio programado a +24 hs, pujas bloqueadas)
            var Upcomingauction = new Auction
            {
                Status = AuctionStatus.Published,
                BasePrice = 120000m,
                CurrentBid = 120000m,
                MinimumIncrement = 10000m,
                StartDate = now.AddHours(24),
                EndDate = now.AddHours(48),
                UserId = seller1.Id,
                Version = 1
            };
            var Upcomingproduct = new Product
            {
                Title = "Smart TV 65 4K",
                Description = "Subasta próxima programada para iniciar en 24 horas.",
                ImageUrl = "https://example.com/tv.jpg",
                Auction = Upcomingauction
            };
            Upcomingauction.Product = Upcomingproduct;
            Upcomingauction.Categories = new List<Category> { Technology };
            Upcomingauction.Bids = new List<Bid>();

            // 4. Subasta Vencida con Ganador (Fecha fin pasada + puja ganadora para probar cierre y liquidación del worker)
            var ExpiredWithWinnerAuction = new Auction
            {
                Status = AuctionStatus.Published,
                BasePrice = 25000m,
                CurrentBid = 35000m,
                MinimumIncrement = 5000m,
                StartDate = now.AddHours(-5),
                EndDate = now.AddMinutes(-10), // Ya vencida
                UserId = seller1.Id,
                Version = 1
            };
            var ExpiredWithWinnerProduct = new Product
            {
                Title = "Campera de Cuero Vintage",
                Description = "Subasta vencida con oferta ganadora pendiente de liquidación por worker.",
                ImageUrl = "https://example.com/campera.jpg",
                Auction = ExpiredWithWinnerAuction
            };
            ExpiredWithWinnerAuction.Product = ExpiredWithWinnerProduct;
            ExpiredWithWinnerAuction.Categories = new List<Category> { Apparel };

            var WinnerBid = new Bid
            {
                Amount = 35000m,
                CreatedAt = now.AddHours(-1),
                UserId = buyer2.Id,
                Auction = ExpiredWithWinnerAuction
            };
            ExpiredWithWinnerAuction.Bids = new List<Bid> { WinnerBid };

            // 5. Subasta Vencida Desierta (Fecha fin pasada sin pujas para probar pase a DESIERTA)
            var ExpiredDesertedAuction = new Auction
            {
                Status = AuctionStatus.Published,
                BasePrice = 80000m,
                CurrentBid = 80000m,
                MinimumIncrement = 5000m,
                StartDate = now.AddDays(-2),
                EndDate = now.AddHours(-1), // Ya vencida sin ofertas
                UserId = seller1.Id,
                Version = 1
            };
            var ExpiredDesertedProduct = new Product
            {
                Title = "Bicicleta de Ruta Clásica",
                Description = "Subasta vencida sin ofertas para probar pase automático a estado Desierta.",
                ImageUrl = "https://example.com/bicicleta.jpg",
                Auction = ExpiredDesertedAuction
            };
            ExpiredDesertedAuction.Product = ExpiredDesertedProduct;
            ExpiredDesertedAuction.Categories = new List<Category> { Vehicles };
            ExpiredDesertedAuction.Bids = new List<Bid>();

            context.Auctions.AddRange(
                Activeauction,
                Criticalauction,
                Upcomingauction,
                ExpiredWithWinnerAuction,
                ExpiredDesertedAuction
            );

            context.SaveChanges();
        }
    }
}
