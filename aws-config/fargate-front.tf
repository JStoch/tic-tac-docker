# task for running the client app
resource "aws_ecs_task_definition" "tictactoe_client" {
  family = "tictactoe-family"
  requires_compatibilities = ["FARGATE"]
  network_mode = "awsvpc"
  task_role_arn = "arn:aws:iam::027362156625:role/LabRole"
  execution_role_arn = "arn:aws:iam::027362156625:role/LabRole"
  cpu = "1024"
  memory = "3072"
  container_definitions = jsonencode([
    {
      name = "client_app"
      image = "027362156625.dkr.ecr.us-east-1.amazonaws.com/tictactoe-frontend:v1" # uri to the image in aws repository
      essential = true
      cpu = 512
      portMappings = [
        {
          containerPort = 3000,
          hostPort = 3000,
          protocol = "tcp"
        },
      ],
    }
  ])
}
# run a service for the client app
# launch one service at the time using fargate
resource "aws_ecs_service" "tictactoe_service_frontend" {
  name = "tictactoe_client_service"
  cluster = aws_ecs_cluster.tictactoe_cluster.id
  task_definition = aws_ecs_task_definition.tictactoe_client.arn
  desired_count = 1
  launch_type = "FARGATE"

  # use the existing configuration made for ec2
  network_configuration {
    subnets = [module.game_cloud.public_subnets[0]]
    security_groups = [aws_security_group.all_out_chosen_in.id]
    assign_public_ip = true
  }
}