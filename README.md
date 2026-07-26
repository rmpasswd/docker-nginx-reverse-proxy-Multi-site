## Demo:

<img width="632" height="899" alt="image" src="https://github.com/user-attachments/assets/1a41dbd8-c978-4769-bbb9-790cb22d22d9" />


## Walkthrough: SSL Certificate For IP Address

Let's Encrypt now also supports IP addresses, but we need to use `lego`, an alternate to the usual `certbot`, to configure SSL for IPv4.

`lego/conf/ip.cnf` in the project tree.
```
[ req ]
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[ dn ]
O = MAHIN_AHMAD_CORP

[ v3_req ]
subjectAltName = IP:35.240.190.73
```

inside lego/conf directory, run bash commands:
```
openssl genrsa -out ip.key 2048
openssl req -new -key ip.key -out ip.csr -config ip.cnf
ls
# ip.cnf  ip.csr  ip.key
```

map this directory to lego container volume mapping in yaml file:
```
  cert_lego:
    image: goacme/lego
    container_name: cert_lego
    volumes:
      - ./lego/conf:/etc/lego
      - ./lego/www:/var/www/lego
    command: > # just 'run' instead of 'lego run' because the entrypoint(go to docker inspect) contains /lego already!
      run
      --server letsencrypt
      --email ${MY_EMAIL}
      --accept-tos
      --http.webroot /var/www/lego
      --http
      --csr /etc/lego/ip.csr
      --path /etc/lego
      --profile shortlived
      --log.level debug
```
`docker compose down && docker compose up  --build`. We cannot update nginx config file to use SSL certificates just yet. First we have to run docker with the following config. Otherwise this error will throw: `nginx: [emerg] cannot load certificate "/etc/lego/certificates/35.240.190.73.crt": BIO_new_file() failed (SSL: error:80000002:system library::No such file or directory:calling fopen(/etc/lego/certificates/35.240.190.73.crt, r) error:10000080:BIO routines::no such file) `  

To use custom ${variables} from a .env file in nginx config files, we need to write the config file inside nginx' **templates** directory and run `docker restart container_name` everytime we change the config, not `nginx -s reload`. For simple use cases, disregard this.
```
server {
    listen 80;
    # server_name localhost;
    server_name ${NGINX_SERVER_NAME};

    
    # These two redirect lines are necessary as /site1 implies a file rather than a directory, resutling in /css/style.css file not loading
    location =/site1 {
        return 301 https://$host/site1/;
        }
    location =/site2 {
        return 301 https://$host/site2/;
    }

     location /site1/ {
         proxy_pass http://site1/;
     }
     location /site2/ {
         proxy_pass http://site2/;
     }
    # return 301 https://$host$request_uri;

    location /.well-known/acme-challenge/ {
        root /var/www/lego;
    }
}
```  

We can see it successfully exit(code 0) in following picture:  
  <img width="1343" height="870" alt="image" src="https://github.com/user-attachments/assets/bf37e585-91c1-4e56-b22c-e442c5456221" />


Notice for IP4, letsencrypt issues [6 days](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability) temporary cert. Hence we have to run a cronjob every ~5 days to renew the cert. In your local machine:
- `crontab -e` to open crontab editor, add the following line at the end.
-  `0 22  */5 * * /usr/bin/docker compose -f ~/docker-nginx-reverse-proxy-Multi-site/docker-compose.yaml up cert_lego`

And finally modify the [nginx file](./nginx/templates/default.conf.template) to allow https and redirect http, notice the crucial lines ssl_certificate file types are different for lego, `certbot` tool would produce .pem files:
```
server  {

    listen 443 ssl;
    server_name ${NGINX_SERVER_NAME};

    ssl_certificate /etc/lego/certificates/35.240.190.73.crt;
    ssl_certificate_key /etc/lego/ip.key;
```



