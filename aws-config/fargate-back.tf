# see comments in fargate-front
# this configuration is almost identical
# only names and image uri is changed
resource "aws_ecs_task_definition" "tictactoe_server" {
  family = "tictactoe-family"
  requires_compatibilities = ["FARGATE"]
  network_mode = "awsvpc"
  task_role_arn = "arn:aws:iam::027362156625:role/LabRole"
  execution_role_arn = "arn:aws:iam::027362156625:role/LabRole"
  cpu = "1024"
  memory = "3072"
  container_definitions = jsonencode([
    {
      name = "game_server"
      image = "027362156625.dkr.ecr.us-east-1.amazonaws.com/tictactoe-backend:v1"
      essential = true
      cpu = 512
      portMappings = [
        {
          containerPort = 8080,
          hostPort = 8080,
          protocol = "tcp"
        },
      ],
    }
  ])
}
resource "aws_ecs_service" "tictactoe_service_backend" {
  name = "tictactoe_server_service"
  cluster = aws_ecs_cluster.tictactoe_cluster.id
  task_definition = aws_ecs_task_definition.tictactoe_server.arn
  desired_count = 1
  launch_type = "FARGATE"

  network_configuration {
    subnets = [module.game_cloud.public_subnets[0]]
    security_groups = [aws_security_group.all_out_chosen_in.id]
    assign_public_ip = true
  }
}