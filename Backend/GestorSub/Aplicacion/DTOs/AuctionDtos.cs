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
}
