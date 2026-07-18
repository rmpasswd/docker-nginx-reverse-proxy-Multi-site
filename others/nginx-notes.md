
Nginx is the alternative of webservers:
- Apache
- Microsoft IIS

Traditional(90s) web servers spawned new processes for new connections and was quick to slow down. Nginx can handle 100000+ connections as each processes can process multiple connections concurrently.

Nginx follows event-driven architecture, async and non-blocking I/O. This is why it can handle multiple connections concurrently.

Workflow:

Incoming request is handed to an 'event loop'. The 'event loop' passes to next step: processing the event and send Response! Thus creating a loop.


Nginx spawns several processes called 'worker process'. Each worker has its own event loops. A Master process manages all the worker processes. multiple chefs, multiple waiters, one supervisor!


Another functionality is being a load balancer. If multiple instances of the web server is launched, the load balancer feature can DISTRIBUTE incoming requests to the differece instaces of web servers, ensuring no single server is overloaded.

Reverse Proxy feature:

Sits between the web server and the internet. Processes *incoming traffics*.
Act as the middleman between the user and web server. It could be just one server or multiple. Example: a local school can use a reverse proxy to scan request and block traffics originating from outside the country etc.


Forward Proxy:

This time the direction is from the user perspective, between the user and the internet(target server). A forward proxy can act as the 'gatekeeper' of outgoing traffics. Example: If a user tries to access certain parts of an internal company webserver, they should be blocked. Or protect the client(user) identity (sits in the browser). Another example is blocking facebook.com during office hours using a custom firewall(not nginx), the request dropped and does not reach the internet.

Cache:

Stores copy of the web server contents to response without hitting the backend servers when similar requests come in. 


Configuration: /etc/nginx/sites-available
contains config for each website we want to host

Configuration: /etc/nginx/sites-enabled

Not all the the available website are turned on! Only the enabled ones are served.





Configuration: /etc/nginx/nginx.conf

```
user www-data; # a seperate user called 'www-data' is created.
worker_processes auto; # we can type a number here. e.g. 4
pid /run/nginx.pid # PID file location or Nginx's master process
events {
    worker_connection 1024; # this means max. num of simultaneous network connection.
    # to know the number of max client(users). multiply worker_processes(e.g. 4) with worker_connection(1024) = 4096 client connections
}

http {
    # http related configs: log format, keep-alive, timeout, rate limiting
}

server { # virtual hosts
  # config for server 1  
  listen 80;
  server_naame domain.com;
  root /location/of/website/files;
  index index.html; # name of the default file to be served
  
  location /{
      
      # Rules or 'directives' to follow depending on what the user typed. 
      # "/" means when the user types the domain.com do these things:
      # try_files $uri $uri/ =404; # example.com is ok, but example.com/anything =404 !
      # https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files
  
    
  }
}

server {
    config for server 2, serving a different website
}
```

