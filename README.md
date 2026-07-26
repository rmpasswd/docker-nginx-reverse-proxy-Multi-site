

### SSL Certificate For IP Address

Let's Encrypt now also supports IP addresses, but we need to use lego, an alternate to certbot, to configure SSL for IPV4.


`lego/conf/ip.cnf` file
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
    command: >
      run
      --server=https://acme-staging-v02.api.letsencrypt.org/directory 
        --email $MY_EMAIL 
        --accept-tos 
        --http 
        --http.webroot /var/www/lego
        --domains 35.240.190.73 
        --disable-cn  
        run --profile shortlived
```

`docker compose down && docker compose up  --build`. We cannot update nginx config file to use SSL certificates just yet. First we have to run docker with existing config

