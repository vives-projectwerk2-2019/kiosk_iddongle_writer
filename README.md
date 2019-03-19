# kiosk_iddongle_writer

## setting up docker on pi
curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh
sudo usermod -aG docker pi
sudo systemctl start docker
sudo systemctl enable docker
bouwen image:
docker build -t kiosk_iddongle_writer .