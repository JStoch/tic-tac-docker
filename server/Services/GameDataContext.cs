using server.Models;

namespace server.Services
{
    public class GameService {
        public Queue<PlayerModel> WaitingPool { get; set; }
        public Dictionary<string, GameModel> ActiveGames { get; set;}

        public GameService() {
            WaitingPool = new Queue<PlayerModel>();
            ActiveGames = [];
        }

        public PlayerModel? FindAvailablePlayer() {
            if (WaitingPool.Count == 0) {
                return null;
            }
            return WaitingPool.Dequeue();
        }

        public void AddToWaitingList(PlayerModel player) {
            WaitingPool.Enqueue(player);
        }

        public GameModel StartNewGame(PlayerModel player1, PlayerModel player2) {
            var gameGuid = Guid.NewGuid().ToString();
            var game = new GameModel(gameGuid, player1, player2);
            ActiveGames.Add(gameGuid, game);
            return game;
        }

        public GameModel? GetGame(string guid) {
            if (ActiveGames.TryGetValue(guid, out GameModel? value)) {
                return value;
            } else {
                return null;
            }
        }

        public void FinalizeGame(string gameGuid) {
            ActiveGames.Remove(gameGuid);
        }
    }
}