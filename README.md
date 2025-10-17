# node-linkedin-backend
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/KauaOnoratoDev/node-linkedin-backend)

This project is a Node.js backend application designed to automate interactions with the LinkedIn API. It provides a complete solution for handling OAuth 2.0 authentication, secure token management, and a multi-step workflow for publishing image posts to a LinkedIn profile.

Built with TypeScript, Express, and TypeORM, the application is fully containerized with Docker for straightforward setup and deployment.

## Features

*   **LinkedIn OAuth 2.0 Authentication**: Simplifies the authorization flow to obtain user access tokens.
*   **Secure Token Management**: Stores access tokens in a PostgreSQL database and includes logic to detect when a token is nearing its expiration date.
*   **Content Publishing API**: A complete set of endpoints for publishing a post with an image:
    1.  Register an upload intent with LinkedIn.
    2.  Upload the image asset.
    3.  Publish the post with text and the uploaded image.
*   **Containerized Environment**: Comes with `docker-compose.yml` to easily spin up the application, a PostgreSQL database, and an n8n instance.
*   **Secure Endpoints**: Utilizes an API key middleware to protect all sensitive operations.
*   **Structured Architecture**: Follows a clean architecture pattern with distinct layers for controllers, use cases, and repositories.

## Technology Stack

*   **Backend**: Node.js, Express.js
*   **Language**: TypeScript
*   **Database**: PostgreSQL
*   **ORM**: TypeORM
*   **Containerization**: Docker, Docker Compose
*   **Testing**: Jest, ts-jest
*   **HTTP Client**: Axios

## Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

*   Git
*   Docker
*   Docker Compose

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/kauaonoratodev/node-linkedin-backend.git
    cd node-linkedin-backend
    ```

2.  **Create your environment file:**
    Copy the example environment file to create your own configuration.
    ```sh
    cp env-example .env
    ```

3.  **Configure environment variables in `.env`:**
    You will need to create a LinkedIn Developer App to get your client credentials.

    *   `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`: Credentials for the PostgreSQL database. The defaults in `env-example` will work with the provided Docker Compose setup.
    *   `CLIENT_ID`: Your LinkedIn application's Client ID.
    *   `CLIENT_SECRET`: Your LinkedIn application's Client Secret.
    *   `REDIRECT_URI`: The callback URL for your LinkedIn app. It must be set to `http://localhost:3000/auth` for the default local setup.
    *   `API_KEY`: A secret key of your choice. This key is used to authorize requests to this backend's protected endpoints.

4.  **Build and run with Docker Compose:**
    This command will build the application's Docker image and start all the necessary services (app, database, and n8n). The application will be available at `http://localhost:3000`.

    ```sh
    docker-compose up --build
    ```

## API Endpoints

### Authentication

These endpoints manage the LinkedIn OAuth 2.0 flow.

#### `GET /login`
Initiates the authentication process by redirecting the user to the LinkedIn authorization page. You should direct users here to begin.

#### `GET /auth`
This is the redirect URI that LinkedIn calls after the user grants permission. The backend exchanges the authorization code for an access token and stores it securely in the database.

---

### Protected Endpoints
The following endpoints require an `api-key` header for authorization.

**Header:** `api-key: your_api_key`

#### `GET /get`
Retrieves the currently stored, valid access token from the database.
*   **Success Response (200 OK):**
    ```json
    {
      "access_token": "AQUI..."
    }
    ```
*   **Error Response (401 Unauthorized):**
    If the token is nearing expiration (less than 5 days remaining).
    ```json
    {
      "error": "Token is nearing expiration."
    }
    ```
*   **Error Response (404 Not Found):**
    If no token is found in the database.
    ```json
    {
      "error": "Token not found."
    }
    ```

#### `POST /upload`
Uploads an image file to the server's local storage. This is the first step in the publishing workflow.
*   **Request:** `multipart/form-data` with a single file field named `image`.
*   **Success Response (200 OK):**
    ```json
    {
        "filename": "Image.png",
        "path": "dist/uploads/Image.png",
        "mimetype": "image/png",
        "size": 12345
    }
    ```

#### `POST /registerUpload`
Step 2: Registers the intent to upload an image with LinkedIn and gets a dedicated upload URL.
*   **Request Body:**
    ```json
    {
      "sub": "linkedin_user_id"
    }
    ```
*   **Success Response (200 OK):**
    Contains the `uploadUrl` and `asset` URN needed for the next steps.
    ```json
    {
      "value": {
        "uploadUrl": "https://www.linkedin.com/media/upload/...",
        "asset": "urn:li:digitalmediaAsset:...",
        ...
      }
    }
    ```

#### `POST /uploadLinkedinImage`
Step 3: The server uploads the image (from the `/upload` step) to the `uploadUrl` obtained from LinkedIn.
*   **Request Body:**
    ```json
    {
      "uploadUrl": "https://www.linkedin.com/media/upload/..."
    }
    ```
*   **Success Response (200 OK):**
    Indicates that the image was successfully uploaded to LinkedIn's servers.

#### `POST /publish`
Step 4: Publishes the final post to LinkedIn using the `asset` URN.
*   **Request Body:**
    ```json
    {
      "sub": "linkedin_user_id",
      "media": "urn:li:digitalmediaAsset:...",
      "text": "This is the content of my post!"
    }
    ```
*   **Success Response (200 OK):**
    Confirms the post was published and returns the post ID.
    ```json
    {
        "id": "urn:li:share:..."
    }
    ```

## Project Structure

The project follows a clean architecture to separate concerns.

```
src/
├── config/         # Database, Multer, and dependency injection setup.
├── controllers/    # Express controllers to handle HTTP requests.
├── entities/       # TypeORM entity definitions.
├── interfaces/     # Repository interfaces.
├── middlewares/    # Custom Express middlewares (e.g., API key).
├── repositories/   # Data access logic (interacts with the database).
├── tests/          # Unit and integration tests for all modules.
└── use-cases/      # Core business logic of the application.
```

## Running Tests

To run the full suite of tests and generate a coverage report, use the following command:

```sh
npm run test:coverage
