using Microsoft.AspNetCore.SignalR;
using server.DataContext;
using server.Models;
//TODO what if user looses connection?
//TODO what if msg doesn't go through?
//TODO msg about the need to reconnect
//TODO end game
namespace server.Hubs
{
    public class GameHub(GameDataContext gameDataContext) : Hub
    {
        private readonly GameDataContext gameData = gameDataContext;

        public async Task RequestConnection(string guid, string userName)
        {
            Console.WriteLine("Connection requested");
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
            Console.WriteLine($"Move recieved");
            var game = gameData.GetGame(gameGuid);
            if (game != null && game.TryToMove(playerGuid)) {
                Console.WriteLine($"About to send move {move}");
                await Clients.Client(game.GetActivePlayer().Connection).SendAsync("Move", move);
                Console.WriteLine("Move sent");
            }
        }
    }
}