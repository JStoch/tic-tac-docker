#!/bin/bash

cd ~
git clone https://github.com/JStoch/tic-tac-docker.git
cd tic-tac-docker

# install docker and docker compose
sudo apt update
sudo apt install -y docker docker-compose

# create user for docker daemon
sudo usermod -aG docker $USER
sudo systemctl restart docker

sudo docker-compose up