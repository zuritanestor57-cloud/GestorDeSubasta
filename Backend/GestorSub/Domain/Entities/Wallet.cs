using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    internal class Wallet
    {
        public int Id { get; set; } 
        public decimal TotalBalance { get; set; } 
        public decimal HeldBalance { get; set; } 
        public decimal AvailableBalance { get; set; } 
        public int Version { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }
        public ICollection<Transaction> Transactions { get; set; }
    }   
}
