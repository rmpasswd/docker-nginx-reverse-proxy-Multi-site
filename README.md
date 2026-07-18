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
<img width="1461" height="116" alt="image" src="https://github.com/user-attachments/assets/84b1f26d-c9ed-426d-9c51-df7e8f504190" />  

## Nginx configuration   

<img width="165" height="112" alt="image" src="https://github.com/user-attachments/assets/a9443efe-48a5-408b-aef4-36f3df777d82" />  

`/etc/nginx/conf.d/sites.conf` file to serve files from two containers.
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

tldr: On every push to 'main' branch, a worker will connect to server machine via SSH, run _git pull_ and additionally `docker compose up -d --build` and nginx reload commands.

1. **Generate Key pair:** First, to setup SSH we have to generate a public-private keypair. Go to the server: `mkdir ~/.ssh` followed by `ssh-keygen -t ed25519 -f "~/.ssh/deployer-gaction.key" -N ""`
2. **Copy Private Key:** Two files will appear in ~/.ssh directory. `cat ~/.ssh/deployer-gaction.key` to copy the **private key**
3. **Set up secrets in Github Repo Settings**: Now go to github > repository settings > Actions
   <img width="1067" height="128" alt="image" src="https://github.com/user-attachments/assets/e6273495-32cb-4fa3-a597-4f18206ad4f2" />  
what
   <img width="265" height="318" alt="image" src="https://github.com/user-attachments/assets/b2de917b-38ff-4b38-a09b-42758a9a51f2" />  
   
    - Notice there are two types of **secrets**(ignore the variables tab). Environment secrets is fine, click manage and give a name for the environment. The name will be used inside worker yaml code.
           <img width="903" height="551" alt="image" src="https://github.com/user-attachments/assets/d49c5a24-bb12-481d-86b3-e51660eb4728" />  
            <img width="860" height="170" alt="image" src="https://github.com/user-attachments/assets/2f16bd50-2713-4289-9526-7768c1029b9b" />  

    - After making a new environment, click the environment > click add env secret  
            <img width="825" height="92" alt="image" src="https://github.com/user-attachments/assets/eff42ed3-b0a6-401b-bedd-4ccb652fe450" />  

    - Paste the private key with the name: SSH_SERVER_KEY. Add others as well: SSH_HOST_IP & SSH_USERNAME  
           <img width="182" height="149" alt="image" src="https://github.com/user-attachments/assets/4f287730-2149-4bf8-ae26-feebad085b7d" />  
3a. **Additional Step for GCP VM:** For my GCP VM, before ssh-keygen keys can be used outside the VM, the public key needs to be added to either "Metadata Settings" or more preferably the VM instance-specific settings. Go to Compute Engine > VM Instances > Edit:  
        <img width="393" height="193" alt="image" src="https://github.com/user-attachments/assets/bff00daa-7e22-4a6a-bc93-8142afa9341d" />  
        **search for 'ssh' and click 'add item'.**  Paste the **public key** here and Save. `cat ~/.ssh/deployer-gaction.key.public`
       <img width="257" height="606" alt="image" src="https://github.com/user-attachments/assets/9c4059a2-471e-48c0-9486-a5ca9513a2e3" />  
   Now ssh into GCP VM using the private key: `ssh -i key user@ip` is allowed. Github Actions will work as well.

    
5. **Make the workflow/runner yaml file**: Go to 'Actions' tab in top bar and click the blue text link "set up a workflow yourself". Copy paste the file from this repo `.github/workflows/main.yml`
6. Additional configuration for 'git pull': For public repo, ignore this step. But private repo needs authentication and we can leverage our key-pair to do this!
   - Copy the **public key** from the server: `cat ~/.ssh/deployer-gaction.key.pub`. Paste it in Github Repo Settings > "Deploy keys" in left sidebar > "Add deploy key" green button
       <img width="872" height="291" alt="image" src="https://github.com/user-attachments/assets/53ff0b9d-ce00-4ced-987c-a390a15c4a65" />  

## Deployment steps  
## How to run the project locally
## Any assumptions or design decisions  

 
