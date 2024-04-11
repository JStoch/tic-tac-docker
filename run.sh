#!/bin/bash

# install docker and docker compose
sudo apt update
sudo apt install -y docker docker-compose

# create user for docker daemon
sudo usermod -aG docker $USER
sudo systemctl restart docker

sudo docker-compose up