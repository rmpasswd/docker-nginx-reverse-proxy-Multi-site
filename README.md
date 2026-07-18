# docker-nginx-reverse-proxy-Multi-site
DevOps Technical Assessment - RedLime


## Project overview  

This project is a multi-site Nginx reverse proxy that serves multiple websites from a single server. It uses Docker to containerize the Nginx reverse proxy and the websites. It also uses Docker Compose to manage the containers.

## Folder structure  

## Server requirements  

A simple Debian (trixie) linux server has been used for this project.
<img width="907" height="141" alt="image" src="https://github.com/user-attachments/assets/2f5f2de6-ef45-4e3f-a414-72a0897f7580" />


### Server Setup:
After getting a fresh VM, the following steps were taken:

1. `sudo apt update`: update package listing so that install command can find packages.
2. `sudo apt install -y git curl vim`


## Docker setup  

3. `sudo apt install docker` will throw error `Error: Package 'docker' has no installation candidate. However the following packages replace it:  wmdocker`. But `wmdocker` is a different tool. We can visit docker's [official docs](https://docs.docker.com/engine/install/debian/#installation-methods) for Debian installation guidelines. There are three ways: use a convenience script, download the .deb file or the third: setup the docker gpg and repo to apt sources. For future management, using `apt` is better:
    ```
    # Add Docker's official GPG key:
    sudo apt update
    sudo apt install ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc
    
    # Add the repository to Apt sources:
    sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
    Types: deb
    URIs: https://download.docker.com/linux/debian
    Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
    Components: stable
    Architectures: $(dpkg --print-architecture)
    Signed-By: /etc/apt/keyrings/docker.asc
    EOF
    
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    ```


## Docker Compose Usage  

5.  `git clone https://github.com/rmpasswd/docker-nginx-reverse-proxy-Multi-site`: Clone this repo.
6.   `cd docker-nginx-reverse-proxy-Multi-site`
7.   `docker compose up -d` The yaml file will launch 3 containers: site1, site2 and nginx. Following are short explanations:
       - site1 and site2 uses apache(httpd:alpine image) and stores the webpages, be defautl serviign them to port 80 from `/usr/local/apache2/htdocs`. Hence we can simply map the host's `./site*` directory to `htdocs/`
       - For easy configuration in nginx service, bind volume to the `/etc/nginx/conf.d` directory has been made instead of the regular `/etc/nginx/site-available` because it requires creating simlink in `/etc/nginx/site-enabled` as well. But conf.d directory only expects a .conf file to be present. Note that after each modification in `/conf.d` we still have to run `docker compose exec nginx_SERVICE_name nginx -s reload` command.

## Nginx configuration   

<img width="165" height="112" alt="image" src="https://github.com/user-attachments/assets/a9443efe-48a5-408b-aef4-36f3df777d82" />
A simple sites.conf file contains a few lines to serve two container files from the browser: hostIPaddress/site1 or /site2
```
server {
    listen 80;
    # server_name localhost;
    server_name _;

    # These two redirect lines are necessary as /site1 implies a file rather than a directory, resutling in /css/style.css file not loading
    location =/site1 {  return 301 http://localhost/site1/;}
    location =/site2 {  return 301 http://localhost/site2/;}
    
    location /site1/ {
        proxy_pass http://site1/;
    }
    location /site2/ {
        proxy_pass http://site2/;
    }
}

```

## GitHub Actions workflow  
## Deployment steps  
## How to run the project locally  
## Any assumptions or design decisions  
- The backend server is sufficiently large and can host more containers as loads
