# Daruk.io Setup guide

## Local setup:

### 1. Make sure your system has node.js and mongodb installed.

- https://nodejs.org/en/download/
- https://www.mongodb.com/try/download/community

### 2. Clone the project

- https://glab2.skematix.in/client-projects/daruk-io-meet-assistant

### 3. Environment setup

    // We need to set 7 environment variables to run the project
    API_PORT=9000
    SESSION_SECRET=some
    MAIN_DB_URL=mongodb://daruk-mongo:27017/darok
    SESSION_DB_URL=mongodb://daruk-mongo:27017/darok-session
    GOOGLE_CLIENT_ID=812235874474-76hsbrhtk08svnkm2lfcesenv1dt0bn3.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=8M9Od-XzRPIerVobEHEkg_By
    GOOGLE_CALLBACK_URL=http://localhost:9000/google/callback

- API_PORT - Any port number to serve the app
- SESSION_SECRET - Some secret text to secure the session db
- MAIL_DB_URL - User and other app related data going to store in this DB.
- SESSION_DB_URL - User session going to be stored in this db.
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET , GOOGLE_CALLBACK_URL - You need to get these from console.cloud.google.com.

- https://console.cloud.google.com/apis/credentials
- Create new project from the console. and click Create Credential button to create your credentials.
- After that you will get ClientId and Client secret on the right.
- Finally set up call back url down below.
- Place those Clientid ,Client secret and call back url in the env.

### 4. Finally do "yarn" and "yarn dev" or "npm i" and ''npm run dev" to start the dev server.

<br/>

# Production - setup

### 1. Switch to production branch

### 2. Make sure your system has docker and docker-compose installed

- https://docs.docker.com/engine/install/
- https://docs.docker.com/compose/install/

### 3. Environment setup

- Create .env file in project root dir

      // We need to set 7 environment variables to run the project
      API_PORT=9000
      SESSION_SECRET=some
      MAIN_DB_URL=mongodb://localhost/darok
      SESSION_DB_URL=mongodb://localhost/darok-session
      GOOGLE_CLIENT_ID=812235874474-76hsbrhtk08svnkm2lfcesenv1dt0bn3.apps.googleusercontent.com
      GOOGLE_CLIENT_SECRET=8M9Od-XzRPIerVobEHEkg_By
      GOOGLE_CALLBACK_URL=http://localhost:9000/google/callback

- API_PORT - Any port number to serve the app
- SESSION_SECRET - Some secret text to secure the session db
- MAIL_DB_URL - User and other app related data going to store in this DB. (make sure mongodb running properly)
- SESSION_DB_URL - User session going to be stored in this db.
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET , GOOGLE_CALLBACK_URL - You need to get these from console.cloud.google.com.

- https://console.cloud.google.com/apis/credentials
- Create new project from the console. and click Create Credential button to create your credentials.
- After that you will get ClientId and Client secret on the right.
- Finally set up call back url down below.
- Place those Clientid ,Client secret and call back url in the env.

### 3. Inorder make certbot to work. you need to run the nginx webserver with following config

    	server {
        listen 80;
        listen [::]:80;

        root /var/www/html;
        index index.html index.htm index.nginx-debian.html;

        server_name daruk.skematix.in www.daruk.skematix.in;

        location / {
                proxy_pass http://nodejs:9000;
        }

        location ~ /.well-known/acme-challenge {
                allow all;
                root /var/www/html;
        }

	}

- Command on certbot container compose:

		command: certonly --webroot --webroot-path=/var/www/html --email santheep.v@skematix.in --agree-tos --no-eff-email --staging -d daruk.skematix.in -d www.daruk.skematix.in 

- Comment out if any container is using dhparam volume and 443 port. becouse we going to setup ssl that after this step only.

### Run:

	 docker-compose up --build to run all containers

### 4. Make sure certbot exits and all other containers are running properly


		docker-compose ps
<br/>

		// Output
		Name                 Command               State          Ports
		------------------------------------------------------------------------
		certbot     certbot certonly --webroot ...   Exit 0
		nodejs      node app.js                      Up       8080/tcp
		webserver   nginx -g daemon off;             Up       0.0.0.0:80->80/tcp


### 5. You need to check that your credentials have been mounted to the webserver container with

		docker-compose exec webserver ls -la /etc/letsencrypt/live
<br/>

		// Output
		total 16
		drwx------ 3 root root 4096 Dec 23 16:48 .
		drwxr-xr-x 9 root root 4096 Dec 23 16:48 ..
		-rw-r--r-- 1 root root  740 Dec 23 16:48 README
		drwxr-xr-x 2 root root 4096 Dec 23 16:48 example.com


### 6. Recreating certbot by replacing --staging flag with --force-renewal


- Command on certbot container compose:

		command: certonly --webroot --webroot-path=/var/www/html --email santheep.v@skematix.in --agree-tos --no-eff-email --force-renewal -d daruk.skematix.in -d www.daruk.skematix.in 

- Force recreate certbot.

		docker-compose up --force-recreate --no-deps certbot


### 7. Modifying the Web Server Configuration and Service Definition

		docker-compose stop webserver

<br/>

		mkdir dhparam

<br/>

		sudo openssl dhparam -out /home/sammy/node_project/dhparam/dhparam-2048.pem 2048

<br/>

- Here after update the nginx config

		
		server {
			listen 80;
			listen [::]:80;
			server_name daruk.skematix.in www.daruk.skematix.in;

			location ~ /.well-known/acme-challenge {
			allow all;
			root /var/www/html;
			}

			location / {
					rewrite ^ https://$host$request_uri? permanent;
			}
		}

		server {
			listen 443 ssl http2;
			listen [::]:443 ssl http2;
			server_name daruk.skematix.in www.daruk.skematix.in;

			server_tokens off;

			ssl_certificate /etc/letsencrypt/live/daruk.skematix.in/fullchain.pem;
			ssl_certificate_key /etc/letsencrypt/live/daruk.skematix.in/privkey.pem;

			ssl_buffer_size 8k;

			ssl_dhparam /etc/ssl/certs/dhparam-2048.pem;

			ssl_protocols TLSv1.2 TLSv1.1 TLSv1;
			ssl_prefer_server_ciphers on;

			ssl_ciphers ECDH+AESGCM:ECDH+AES256:ECDH+AES128:DH+3DES:!ADH:!AECDH:!MD5;

			ssl_ecdh_curve secp384r1;
			ssl_session_tickets off;

			ssl_stapling on;
			ssl_stapling_verify on;
			resolver 8.8.8.8;

			location / {
					try_files $uri @nodejs;
			}

			location @nodejs {
					proxy_pass http://nodejs:9000;
					add_header X-Frame-Options "SAMEORIGIN" always;
					add_header X-XSS-Protection "1; mode=block" always;
					add_header X-Content-Type-Options "nosniff" always;
					add_header Referrer-Policy "no-referrer-when-downgrade" always;
					add_header Content-Security-Policy "default-src * data: 'unsafe-eval' 'unsafe-inline'" always;
					# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
					# enable strict transport security only if you understand the implications
			}

			root /var/www/html;
			index index.html index.htm index.nginx-debian.html;
		}

- Finally force recreate webserver

		docker-compose up -d --force-recreate --no-deps webserver


### Visit daruk.skematix.in to verify App works with ssl or not