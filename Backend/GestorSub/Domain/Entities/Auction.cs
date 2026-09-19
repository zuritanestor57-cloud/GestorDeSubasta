using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Auction
    {
        public int Id { get; set; }
        public AuctionStatus Status { get; set; } 
        public decimal BasePrice { get; set; } 
        public decimal CurrentBid { get; set; } 
        public decimal MinimumIncrement { get; set; } 
        public DateTime StartDate { get; set; } 
        public DateTime EndDate { get; set; } 
        public int Version { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public ICollection<Bid> Bids { get; set; } = new List<Bid>();
        public Product Product { get; set; } = null!;
        public ICollection<Category> Categories { get; set; } = new List<Category>();
    }
    public enum AuctionStatus
    {
        Draft,      
        Published,  
        Active,
        Cancelled,  
        Finished,
        Deserted
    }
}
