namespace server.Models {
    public class PlayerModel(string guid, string name, string connection)
    {
        public readonly string Guid = guid;
        public string Name { get; set; } = name;
        public string Connection { get; set; } = connection;
    }
}