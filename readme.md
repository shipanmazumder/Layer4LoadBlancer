## Layer 4 Load Balancing Node.js servers with Nginx

This project demonstrates how to set up layer 4 load balancing for Node.js servers using Nginx. We'll create a simple Node.js application and configure Nginx to distribute incoming traffic across multiple Node.js servers.

### Prerequisites

- Node.js
- Nginx
- Docker
- MySQL

### Setting up the Node.js servers

1. Create a new directory for the Node.js server:

   ```bash
   mkdir server1
   cd server1
   npm init -y
   npm install express body-parser mysql2
   ```

   Create a new file called `index.js` and add the following code:

   ```javascript
   const express = require("express");
   const mysql = require("mysql2");
   const bodyParser = require("body-parser");

   const app = express();
   const port = 3001;

   const dbConfig = {
   	host: "localhost",
   	user: "my_user",
   	port: 3308,
   	password: "my_password",
   	database: "my_db",
   };

   app.use(bodyParser.json());

   function createConnection() {
   	const connection = mysql.createConnection(dbConfig);
   	connection.connect((error) => {
   		if (error) {
   			console.error("Error connecting to the database:", error);
   			return null;
   		}
   		console.log("Connected to MySQL database");
   	});
   	return connection;
   }

   function createTable() {
   	const connection = createConnection();
   	if (connection) {
   		const createTableQuery = `
         CREATE TABLE IF NOT EXISTS users (
           id INT AUTO_INCREMENT PRIMARY KEY,
           name VARCHAR(255) NOT NULL,
           email VARCHAR(255) NOT NULL UNIQUE
         )
       `;
   		connection.query(createTableQuery, (error, results) => {
   			connection.end();
   			if (error) {
   				console.error("Error creating table:", error);
   			} else {
   				console.log('Table "users" ensured to exist');
   			}
   		});
   	}
   }

   createTable();

   app.get("/", (req, res) => {
   	const connection = createConnection();
   	if (connection) {
   		res.status(200).json({
   			message: "Hello, from Node App 1! Connected to MySQL database.",
   		});
   		connection.end();
   	} else {
   		res.status(500).json({ message: "Failed to connect to MySQL database" });
   	}
   });

   app.get("/users", (req, res) => {
   	const connection = createConnection();
   	if (connection) {
   		connection.query("SELECT * FROM users", (error, results) => {
   			connection.end();
   			if (error) {
   				return res
   					.status(500)
   					.json({ message: "Error fetching users", error });
   			}
   			res.json(results);
   		});
   	} else {
   		res.status(500).json({ message: "Failed to connect to MySQL database" });
   	}
   });

   app.post("/users", (req, res) => {
   	const connection = createConnection();
   	const { name, email } = req.body;

   	if (!name || !email) {
   		return res.status(400).json({ message: "Name and email are required" });
   	}

   	if (connection) {
   		const query = "INSERT INTO users (name, email) VALUES (?, ?)";
   		connection.query(query, [name, email], (error, results) => {
   			connection.end();
   			if (error) {
   				return res.status(500).json({ message: "Error adding user", error });
   			}
   			res
   				.status(201)
   				.json({ message: "User added", userId: results.insertId });
   		});
   	} else {
   		res.status(500).json({ message: "Failed to connect to MySQL database" });
   	}
   });

   app.listen(port, () => {
   	console.log(`App running on http://localhost:${port}`);
   });
   ```

2. Create another directory for the second Node.js server:

   ```bash
   mkdir server2
   cd server2
   npm init -y
   npm install express body-parser mysql2
   ```

   Create a new file called `index.js` and add the following code:

   ```javascript
   const express = require("express");
   const mysql = require("mysql2");
   const bodyParser = require("body-parser");

   const app = express();
   const port = 3002;

   const dbConfig = {
   	host: "localhost",
   	user: "my_user",
   	port: 3308,
   	password: "my_password",
   	database: "my_db",
   };

   app.use(bodyParser.json());

   function createConnection() {
   	const connection = mysql.createConnection(dbConfig);
   	connection.connect((error) => {
   		if (error) {
   			console.error("Error connecting to the database:", error);
   			return null;
   		}
   		console.log("Connected to MySQL database");
   	});
   	return connection;
   }

   function createTable() {
   	const connection = createConnection();
   	if (connection) {
   		const createTableQuery = `
         CREATE TABLE IF NOT EXISTS users (
           id INT AUTO_INCREMENT PRIMARY KEY,
           name VARCHAR(255) NOT NULL,
           email VARCHAR(255) NOT NULL UNIQUE
         )
       `;
   		connection.query(createTableQuery, (error, results) => {
   			connection.end();
   			if (error) {
   				console.error("Error creating table:", error);
   			} else {
   				console.log('Table "users" ensured to exist');
   			}
   		});
   	}
   }

   createTable();

   app.get("/", (req, res) => {
   	const connection = createConnection();
   	if (connection) {
   		res.status(200).json({
   			message: "Hello, from Node App 2! Connected to MySQL database.",
   		});
   		connection.end();
   	} else {
   		res.status(500).json({ message: "Failed to connect to MySQL database" });
   	}
   });

   app.get("/users", (req, res) => {
   	const connection = createConnection();
   	if (connection) {
   		connection.query("SELECT * FROM users", (error, results) => {
   			connection.end();
   			if (error) {
   				return res
   					.status(500)
   					.json({ message: "Error fetching users", error });
   			}
   			res.json(results);
   		});
   	} else {
   		res.status(500).json({ message: "Failed to connect to MySQL database" });
   	}
   });

   app.post("/users", (req, res) => {
   	const connection = createConnection();
   	const { name, email } = req.body;

   	if (!name || !email) {
   		return res.status(400).json({ message: "Name and email are required" });
   	}

   	if (connection) {
   		const query = "INSERT INTO users (name, email) VALUES (?, ?)";
   		connection.query(query, [name, email], (error, results) => {
   			connection.end();
   			if (error) {
   				return res.status(500).json({ message: "Error adding user", error });
   			}
   			res
   				.status(201)
   				.json({ message: "User added", userId: results.insertId });
   		});
   	} else {
   		res.status(500).json({ message: "Failed to connect to MySQL database" });
   	}
   });

   app.listen(port, () => {
   	console.log(`App running on http://localhost:${port}`);
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

4. Run the MySQL server:

```bash
docker run --name my_mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=my_db \
  -e MYSQL_USER=my_user \
  -e MYSQL_PASSWORD=my_password \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  -d mysql:latest

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
