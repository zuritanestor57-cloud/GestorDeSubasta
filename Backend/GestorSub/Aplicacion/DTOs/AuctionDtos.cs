using Domain.Entities;

namespace Aplicacion.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CreateAuctionDto
    {
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public List<int> CategoryIds { get; set; } = new();
        public decimal BasePrice { get; set; }
        public decimal MinimumIncrement { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class AuctionDetailDto
    {
        public int Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public decimal CurrentBid { get; set; }
        public decimal MinimumIncrement { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Version { get; set; }
        public int UserId { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public string ProductTitle { get; set; } = string.Empty;
        public string ProductDescription { get; set; } = string.Empty;
        public string ProductImageUrl { get; set; } = string.Empty;
        public List<CategoryDto> Categories { get; set; } = new();
        public int BidsCount { get; set; }
    }

    public class AuctionFilterDto
    {
        public string? SearchTerm { get; set; }
        public int? CategoryId { get; set; }
        public AuctionStatus? Status { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? OrderBy { get; set; }
    }
    public class CreateBidDto
    {
        public int UserId { get; set; }
        public decimal Amount { get; set; }
    }

    public class BidDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string BidderName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class BidResultDto
    {
        public int BidId { get; set; }
        public int AuctionId { get; set; }
        public int UserId { get; set; }
        public string BidderName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime NewEndDate { get; set; }
        public bool AntiSnipingTriggered { get; set; }
        public string Message { get; set; } = string.Empty;
    }

}
