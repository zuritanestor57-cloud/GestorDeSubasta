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
        public User User { get; set; }
        public ICollection<Bid> Bids { get; set; }
        public Product Product { get; set; }
        public ICollection<Category> Categories { get; set; }
    }
    public enum AuctionStatus
    {
        Draft,      
        Published,  
        Cancelled,  
        Finished    
    }
}
