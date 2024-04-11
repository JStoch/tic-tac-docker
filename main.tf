# Inicjalizacja - dostawca i region
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.1"
    }
  }
  required_version = ">= 1.2.0"
}
provider "aws" {
  region = "us-east-1"
}
# VPC - Virtual Private Cloud z podsiecia. 
# Pozostale parametry sieciowe (brama, tablica routingu itp) skonfigurowane domyslnie w ramach VPC
module "game_cloud" {
    source = "terraform-aws-modules/vpc/aws"
    name = "game_cloud"
    cidr = "10.0.0.0/16"
    azs = ["us-east-1b"]
    public_subnets = ["10.0.101.0/24"]
    tags = {
        Terraform = "true"
        Environment = "dev"
    }
}
# Grupa bezpieczenstwa.
# Dopuszczony zostanie caly ruch wychodzacy
# I wejscie na wybranych portach
resource "aws_security_group" "all_out_chosen_in" {
    name = "all_out_chosen_in"
    description = "Allow all outgoing traffic and incoming traffic only on needed ports"
    vpc_id = module.game_cloud.vpc_id
    tags = {
        Name = "all_out_chosen_in"
    }
}
# Dopusc caly wychodzacy ruch sieciowy
resource "aws_vpc_security_group_egress_rule" "allow_all" {
    security_group_id = aws_security_group.all_out_chosen_in.id
    cidr_ipv4 = "0.0.0.0/0"
    ip_protocol = "-1"
}
# Dopusc porty potrzebne aplikacji
resource "aws_vpc_security_group_ingress_rule" "allow_server" {
    security_group_id = aws_security_group.all_out_chosen_in.id
    cidr_ipv4 = "0.0.0.0/0"
    ip_protocol = "tcp"
    from_port = 8080
    to_port = 8081
}
resource "aws_vpc_security_group_ingress_rule" "allow_app" {
    security_group_id = aws_security_group.all_out_chosen_in.id
    cidr_ipv4 = "0.0.0.0/0"
    ip_protocol = "tcp"
    from_port = 3000
    to_port = 3000
}
# Dopusc polaczenie ssh do zarzadzania serwerem
resource "aws_vpc_security_group_ingress_rule" "allow_ssh" {
    security_group_id = aws_security_group.all_out_chosen_in.id
    cidr_ipv4 = "0.0.0.0/0"
    ip_protocol = "tcp"
    from_port = 22
    to_port = 22
}
# Instancja EC2, na ktorej zostanie uruchomiona aplikacja
resource "aws_instance" "tic_tac_toe" {
    ami = "ami-080e1f13689e07408"
    instance_type = "t2.micro"
    key_name = "vockey"
    subnet_id = module.game_cloud.public_subnets[0]
    associate_public_ip_address = "true"
    vpc_security_group_ids = [aws_security_group.all_out_chosen_in.id]
    user_data_replace_on_change = true
    tags = {
        Name = "Tic-Tac-Toe-Game"
    }
}