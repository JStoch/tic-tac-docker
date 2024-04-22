cd ~/Repos/cloud1/client

# authenticate
aws ecr get-login-password --region us-east-1 | sudo docker login --username AWS --password-stdin 027362156625.dkr.ecr.us-east-1.amazonaws.com/tictactoe-frontend

# build
sudo docker build -t tictactoe-frontend:v1 -t 027362156625.dkr.ecr.us-east-1.amazonaws.com/tictactoe-frontend:v1 .

# push
sudo docker push 027362156625.dkr.ecr.us-east-1.amazonaws.com/tictactoe-frontend:v1

# start service
cd ../aws-config
mv fargate-front fargate-front.tf
terraform apply -auto-approve