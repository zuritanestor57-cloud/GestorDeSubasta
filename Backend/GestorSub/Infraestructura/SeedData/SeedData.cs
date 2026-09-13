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

            //casos de prueba para subastas
            var Activeauction = new Auction
            {
                Status = AuctionStatus.Published,
                BasePrice = 30000m,
                CurrentBid = 45000m,
                MinimumIncrement = 5000m,
                StartDate = now.AddHours(-1),
                EndDate = now.AddMinutes(25),
                UserId = seller1.Id
            };
            var Activeproduct = new Product
            {
                Title = "Notebook",
                Description = "Notebook de prueba para la subasta.",
                ImageUrl = "https://example.com/notebook.jpg",
                Auction = Activeauction,
            };
            Activeauction.Product = Activeproduct;
            Activeauction.Categories = new List<Category>{Technology,};

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

            Activeauction.Bids = new List<Bid> { Activebid1, Activebid2, };

            var Criticalauction = new Auction
            {
                Status = AuctionStatus.Published,
                BasePrice = 50000m,
                CurrentBid = 60000m,
                MinimumIncrement = 5000m,
                StartDate = now.AddHours(-2),
                EndDate = now.AddSeconds(90),
                UserId = seller1.Id
            };
            var Criticalproduct = new Product
            {
                Title = "Jarron de coleccion ",
                Description = "ConsJarron de coleccion la para probar la subasta crítica.",
                ImageUrl = "https://example.com/consola.jpg",
                Auction = Criticalauction,
            };
            Criticalauction.Product = Criticalproduct;
            Criticalauction.Categories = new List<Category> { Collectibles, };

            var Criticalbid = new Bid
            {
                Amount = 60000m,
                CreatedAt = now.AddMinutes(-1),
                UserId = buyer2.Id,
                Auction = Criticalauction,
            };

            Criticalauction.Bids = new List<Bid> { Criticalbid, };
            context.Auctions.AddRange(Activeauction, Criticalauction);
            context.SaveChanges();
        }
    }
}
