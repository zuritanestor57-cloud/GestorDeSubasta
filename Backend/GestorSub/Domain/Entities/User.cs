using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public UserRole Role { get; set; }

        public Wallet Wallet { get; set; }
        public ICollection<Auction> Auctions { get; set; }
        public ICollection<AuditLog> AuditLogs { get; set; }
        public ICollection<Bid> Bids { get; set; }
    }
    public enum UserRole
    {
        Buyer,
        Seller,
        BuyerAndSeller,
        Administrator
    }
}
