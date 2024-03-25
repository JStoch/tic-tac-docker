using Microsoft.AspNetCore.SignalR;
using server.DataContext;
using server.Models;
//TODO end game
namespace server.Hubs
{
    public class GameHub(GameDataContext gameDataContext) : Hub
    {
        private readonly GameDataContext gameData = gameDataContext;

        public async Task RequestNewGame(string guid, string userName)
        {
            var player = new PlayerModel(guid, userName, Context.ConnectionId);
            var oponnent = gameData.FindAvailablePlayer();
            if (oponnent != null) {
                var game = gameData.StartNewGame(oponnent, player);
                await Clients.Client(oponnent.Connection).SendAsync("NewGame", game.Guid, player.Name, game.CanPlayerMove(oponnent.Guid));
                await Clients.Caller.SendAsync("NewGame", game.Guid, oponnent.Name, game.CanPlayerMove(player.Guid));
            } else {
                gameData.AddToWaitingList(player);
            }
        }

        public async Task Move(string gameGuid, string playerGuid, string move)
        {
            var game = gameData.GetGame(gameGuid);
            if (game != null && game.TryToMove(playerGuid)) {
                await Clients.Client(game.GetActivePlayer().Connection).SendAsync("Move", move);
            }
        }
    }
}