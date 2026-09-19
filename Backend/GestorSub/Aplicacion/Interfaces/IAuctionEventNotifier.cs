using Aplicacion.DTOs;
using System;
using System.Threading.Tasks;

namespace Aplicacion.Interfaces
{
    public interface IAuctionEventNotifier
    {
        Task NotifyBidPlacedAsync(int auctionId, BidPlacedMessageDto message);
        Task NotifyTimeExtendedAsync(int auctionId, TimeExtendedMessageDto message);
        Task NotifyAuctionStartedAsync(int auctionId, AuctionStartedMessageDto message);
        Task NotifyAuctionEndedAsync(int auctionId, AuctionEndedMessageDto message);
    }
}
