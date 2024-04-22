# make a single cluster for both services
resource "aws_ecs_cluster" "tictactoe_cluster" {
  name = "tictactoe_cluster"
}