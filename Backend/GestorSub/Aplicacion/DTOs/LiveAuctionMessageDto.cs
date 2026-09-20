using System;

namespace Aplicacion.DTOs
{
    public class BidPlacedMessageDto
    {
        public int AuctionId { get; set; }
        public int BidId { get; set; }
        public int UserId { get; set; }
        public string BidderName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal MinimumNextBid { get; set; }
    }

    public class TimeExtendedMessageDto
    {
        public int AuctionId { get; set; }
        public DateTime NewEndDate { get; set; }
    }

    public class AuctionStartedMessageDto
    {
        public int AuctionId { get; set; }
        public DateTime StartedAt { get; set; }
    }

    public class AuctionEndedMessageDto
    {
        public int AuctionId { get; set; }
        public DateTime EndedAt { get; set; }
    }
}
