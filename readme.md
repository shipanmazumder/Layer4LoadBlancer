## Layer 4 Load Balancing Node.js servers with Nginx

This project demonstrates how to set up layer 4 load balancing for Node.js servers using Nginx. We'll create a simple Node.js application and configure Nginx to distribute incoming traffic across multiple Node.js servers.

### Prerequisites

- Node.js
- Nginx
- Docker

### Setting up the Node.js servers

1. Create a new directory for the Node.js server:

   ```bash
   mkdir server1
   cd server1
   npm init -y
   npm install express  body-parser
   ```

   Create a new file called `index.js` and add the following code:

   ```javascript
   const express = require("express");
   const bodyParser = require("body-parser");

   const app = express();
   const port = 3001;

   app.use(bodyParser.json());

   app.get("/", (req, res) => {
   	res.send("Hello World from server 1");
   });

   app.listen(port, () => {
   	console.log(`Server is running on port ${port}`);
   });
   ```

2. Create another directory for the second Node.js server:

   ```bash
   mkdir server2
   cd server2
   npm init -y
   npm install express body-parser
   ```

   Create a new file called `server.js` and add the following code:

   ```javascript
   const express = require("express");
   const bodyParser = require("body-parser");

   const app = express();
   const port = 3002;

   app.use(bodyParser.json());

   app.get("/", (req, res) => {
   	res.send("Hello World from server 2");
   });

   app.listen(port, () => {
   	console.log(`Server is running on port ${port}`);
   });
   ```

3. Create a new directory for the Nginx server:

   ```bash
   mkdir nginx
   cd nginx
   ```

   Create a new file called `nginx.conf` and add the following code:

   ```nginx
   events {}

   stream {
       upstream nodejs_backend {
           server host.docker.internal:3001; # Node-app-1
           server host.docker.internal:3002; # Node-app-2
       }

       server {
           listen 80;

           proxy_pass nodejs_backend;

           # Enable TCP load balancing
           proxy_connect_timeout 1s;
           proxy_timeout 3s;
       }
   }
   ```

   Create a Dockerfile for the Nginx server:

   ```dockerfile
   FROM nginx:latest
   COPY nginx.conf /etc/nginx/nginx.conf
   ```

   Build the Docker image:

   ```bash
   docker build -t nginx-loadbalancer .
   ```

4. Run the Node.js server:

```bash
cd server1
node index.js

cd server2
node index.js
```

4. Run the Nginx load balancer:

```bash
docker run -d -p 80:80 --name nginx-loadbalancer nginx-loadbalancer
```

### Testing the setup

Open your browser and navigate to `http://localhost`. You should see the load balancer distributing the requests between the two Node.js servers.
