# URL Shortener Backend

## Overview
This is the backend service for the URL Shortener application. It provides an API to create, retrieve, and manage shortened URLs.

## Installation
To install and run the application, follow these steps:

1. **Clone the repository:**
   ```sh
   git clone git@github.com:tiko-star/url-shortener-api.git
   cd url-shortener-api
   ```

2. **Copy the environment configuration file:**
   ```sh
   cp .env.example .env
   ```

   Configure the necessary environment variables in the `.env` file, including:
   ```sh
   NODE_ENV=development
   APP_URL=http://localhost:3000
   APP_PORT=3000
   APP_HOST=0.0.0.0
   DB_DATABASE=deep_origin
   DB_HOST=mysql
   DB_PORT=3306
   DB_USER=root
   DB_PASS=root
   JWT_SECRET=<your_generated_secret>
   REDIS_HOST=redis
   REDIS_PORT=6379

   MYSQL_ROOT_PASSWORD=root
   MYSQL_DATABASE=deep_origin
   ```

3. **Run the application using Docker Compose:**
   ```sh
   docker-compose up --build
   ```

4. **Generate the `JWT_SECRET` value:**
   After starting the Docker container, enter the Docker image and run:
   ```sh
   docker exec -it <container_name> npm run secret
   ```
   Copy the generated secret and paste it into the `.env` file under `JWT_SECRET`.

5. **Run database migrations:**
   ```sh
   docker exec -it <container_name> npm run migrate
   ```
   This will apply necessary database migrations.

6. **Restart the instance:**
   After running migrations, restart the Docker container to apply all changes:
   ```sh
   docker-compose down && docker-compose up --build
   ```

## Usage
Once the backend is running, the API will be available at:
```
http://localhost:3000
```
Make sure to update the frontend `VITE_API_HOST` variable to match this address.

## Features
- Shorten URLs
- Redirect to original links
- Track usage statistics

## Conclusion
This backend service powers the URL Shortener frontend application. Ensure it is running before using the frontend.
