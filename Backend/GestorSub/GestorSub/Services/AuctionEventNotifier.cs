using Aplicacion.DTOs;
using Aplicacion.Interfaces;
using GestorSub.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace GestorSub.Services
{
    public class AuctionEventNotifier : IAuctionEventNotifier
    {
        private readonly IHubContext<AuctionHub> _hubContext;

        public AuctionEventNotifier(IHubContext<AuctionHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyBidPlacedAsync(int auctionId, BidPlacedMessageDto message)
        {
            var groupName = $"Auction_{auctionId}";
            await _hubContext.Clients.Group(groupName).SendAsync("ReceiveBid", message);
        }

        public async Task NotifyTimeExtendedAsync(int auctionId, TimeExtendedMessageDto message)
        {
            var groupName = $"Auction_{auctionId}";
            await _hubContext.Clients.Group(groupName).SendAsync("ReceiveTimeExtension", message);
        }

        public async Task NotifyAuctionStartedAsync(int auctionId, AuctionStartedMessageDto message)
        {
            var groupName = $"Auction_{auctionId}";
            await _hubContext.Clients.Group(groupName).SendAsync("ReceiveAuctionStarted", message);
        }

        public async Task NotifyAuctionEndedAsync(int auctionId, AuctionEndedMessageDto message)
        {
            var groupName = $"Auction_{auctionId}";
            await _hubContext.Clients.Group(groupName).SendAsync("ReceiveAuctionEnded", message);
        }
    }
}
