using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace GestorSub.Hubs
{
    public class AuctionHub : Hub
    {
        public async Task JoinAuctionGroup(int auctionId)
        {
            var groupName = $"Auction_{auctionId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveAuctionGroup(int auctionId)
        {
            var groupName = $"Auction_{auctionId}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }
}
