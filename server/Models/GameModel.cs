namespace server.Models {
    public class GameModel(string gameGuid, PlayerModel player1, PlayerModel player2)
    {
        public readonly string Guid = gameGuid;
        public readonly PlayerModel Player1 = player1;
        public readonly PlayerModel Player2 = player2;
        private bool Player1Turn = true;

        public bool TryToMove(string playerGuid) {
            bool moveAllowed = CanPlayerMove(playerGuid);
            if (moveAllowed) Player1Turn = !Player1Turn;
            return moveAllowed;
        }

        public bool CanPlayerMove(string playerGuid) {
            return playerGuid == Player1.Guid == Player1Turn;
        }

        public PlayerModel GetActivePlayer() {
            if (Player1Turn) {
                return Player1;
            } else {
                return Player2;
            }
        }

    }
}