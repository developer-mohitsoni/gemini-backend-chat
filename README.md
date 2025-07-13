# Gemini Backend Clone Chat App

This project is a backend application for a chat application, featuring user authentication, chat room management, message handling, and integration with the Gemini API for AI responses. It also includes a queue system for background jobs and Stripe integration for subscription management.

## Table of Contents

- [Gemini Backend Clone Chat App](#gemini-backend-clone-chat-app)
  - [Table of Contents](#table-of-contents)
  - [How to Set Up and Run the Project](#how-to-set-up-and-run-the-project)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Installation](#installation)
    - [Database Setup](#database-setup)
    - [Running the Application](#running-the-application)
  - [Architecture Overview](#architecture-overview)
  - [Queue System Explanation](#queue-system-explanation)
  - [Gemini API Integration Overview](#gemini-api-integration-overview)
  - [Assumptions/Design Decisions](#assumptionsdesign-decisions)
  - [How to Test via Postman](#how-to-test-via-postman)
  - [Access/Deployment Instructions](#accessdeployment-instructions)
    - [Local Development](#local-development)
    - [Production Deployment](#production-deployment)

## How to Set Up and Run the Project

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (Node Package Manager)
- PostgreSQL database (e.g., NeonDB)
- Redis instance (e.g., Upstash)

### Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
JWT_SECRET=your_jwt_secret_key
REDIS_URL=your_redis_url
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRO_PRICE_ID=your_stripe_pro_price_id
FRONTEND_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

- `DATABASE_URL`: Connection string for your PostgreSQL database (e.g., from NeonDB).
- `JWT_SECRET`: A secret key for JWT token generation.
- `REDIS_URL`: Redis URL (TCP) for BullMQ and rate-limitting(e.g., from Upstash).
- `GOOGLE_GENAI_API_KEY`: Your API key for Google Gemini API.
- `STRIPE_SECRET_KEY`: Your Stripe secret key.
- `STRIPE_PRO_PRICE_ID`: Your Stripe pro price id.
- `FRONTEND_URL`: Your Route to the FRONTEND_URL Endpoint for subscription success and cancel.
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret for verifying webhook events.


### Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```

### Database Setup

This project uses Prisma as an ORM.

1.  **Generate Prisma Client:**
    ```bash
    npx prisma generate
    ```
2.  **Run Migrations:**
    ```bash
    npx prisma migrate dev --name init
              OR
    npx prisma db push
    ```

### Running the Application

You can run the application in development mode or build and start it.

**Development Mode (with hot-reloading):**

```bash
npm run dev
```

**Build and Start:**

```bash
npm run build
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## Architecture Overview

The application follows a layered architecture, primarily using Express.js for routing and handling HTTP requests.

-   **`src/index.ts`**: The entry point of the application, setting up Express, CORS, and integrating routes.
-   **`src/routes/`**: Defines API endpoints and webhook endpoint and their corresponding controllers.
-   **`src/controller/`**: Contains the business logic for handling requests, interacting with services and the database.
-   **`src/services/`**: Encapsulates specific functionalities like Gemini API interaction, JWT handling, OTP generation, and Stripe integration.
-   **`src/DB/db.config.ts`**: Configures the Prisma client for database interactions.
-   **`src/middleware/`**: Houses middleware functions for authentication and rate limiting.
-   **`src/validations/`**: Contains Zod schemas for input validation.
-   **`src/config/`**: Configuration files for various services (e.g., Redis, Queue).
-   **`src/jobs/`**: Defines background jobs processed by the queue system (e.g., `SendEmailJobs.ts`).
-   **`prisma/schema.prisma`**: Defines the database schema (User, ChatRoom, Message models).

## Queue System Explanation

The project utilizes `bullmq` with Redis as a message broker for handling background jobs. This is particularly useful for tasks that are time-consuming or should not block the main request-response cycle, such as sending emails.

-   **Configuration**: `src/config/queue.ts` defines default queue configurations, including job removal policies, retry attempts, and backoff strategies.
-   **Jobs**: `src/jobs/SendEmailJobs.ts` is an example of a defined job. Jobs are typically enqueued by services or controllers and processed asynchronously by a worker.
-   **Redis**: Redis is used to store job queues, job states, and results. Ensure your Redis instance is running and accessible.

## Gemini API Integration Overview

The application integrates with the Google Gemini API to provide AI-powered responses within chat messages.

-   **Service**: The `src/services/geminiService.ts` file is responsible for interacting with the Gemini API.
-   **Functionality**: The `getGeminiReply` function sends a user's prompt to the Gemini API and returns the AI-generated response.
-   **API Key**: The `GOOGLE_GEMINI_API_KEY` environment variable is required for authentication with the Gemini API.

## Assumptions/Design Decisions

-   **Database**: PostgreSQL is chosen for its robustness and relational capabilities, managed by Prisma ORM for type-safe database interactions.
-   **Authentication**: JWT (JSON Web Tokens) are used for stateless authentication, managed by `jwtService.ts` and `AuthMiddleware.ts`.
-   **Validation**: Zod is used for schema validation, ensuring incoming data conforms to expected structures.
-   **Background Jobs**: BullMQ is used for asynchronous task processing, offloading heavy operations to a background queue to maintain responsiveness.
-   **CORS**: Configured to allow cross-origin requests, with the origin configurable via environment variables.
-   **Error Handling**: Basic error handling is implemented, with more robust error handling and logging recommended for production.
-   **Scalability**: The use of a queue system and stateless JWTs contributes to better scalability.

## How to Test via Postman

You can use Postman to test the API endpoints.

1.  **Import the API Collection**:
    If available, import the Postman collection for this API. Otherwise, you will need to create requests manually.

2.  **Base URL**:
    Set your base URL to `http://localhost:3000` (or whatever port your server is running on).

3.  **Example Endpoints**:

    -   **User Registration (POST)**: `/auth/signup`
        -   Body: `{ "mobile": "1234567890" }` (Password is optional)
    -   **Send OTP (POST)**: `/auth/send-otp`
        -   Body: `{ "mobile": "1234567890" }`
    -   **Verify OTP (POST)**: `/auth/verify-otp`
        -   Body: `{ "mobile": "1234567890", "otp": "your_otp" }`
    -   **Forgot Password (POST)**: `/auth/forgot-password`
        -   Body: `{ "mobile": "1234567890" }`
    -   **Change Password (POST)**: `/auth/change-password` (Requires authentication)
        -   Body: `{ "newPassword": "your_new_password" }`
    -   **Get User Profile (GET)**: `/user/me` (Requires authentication)
    -   **Create Chat Room (POST)**: `/chatroom` (Requires authentication)
        -   Body: `{ "name": "My New Chat Room" }`
    -   **Get User Chat Rooms (GET)**: `/chatroom` (Requires authentication)
    -   **Get Chat Room by ID (GET)**: `/chatroom/:id` (Requires authentication)
    -   **Send Message (POST)**: `/chatroom/:id/message` (Requires authentication)
        -   Body: `{ "content": "Hello Gemini!" }`
    -   **Start Pro Subscription (POST)**: `/subscribe/pro` (Requires authentication)
    -   **Get Subscription Status (GET)**: `/subscription/status` (Requires authentication)
    -   **Stripe Webhook (POST)**: `/webhook/stripe` (For Stripe events)
        -   You can test your webhook endpoint from Stripe Dashboard


    *Refer to `server/src/routes/api.ts` and `server/src/routes/webhookRoute.ts` for a complete list of endpoints.*

## Access/Deployment Instructions

### Local Development

Follow the "How to Set Up and Run the Project" section to run the application locally.

### Production Deployment

For production deployment, this application can be deployed on platforms like Render. Consider the following:

-   **Environment Variables**: Securely manage environment variables (e.g., using Render's environment groups or secrets).
-   **Database**: Use a managed PostgreSQL database service like NeonDB, which can be easily integrated with Render.
-   **Redis**: Use a managed Redis service like Upstash, which can also be integrated with Render.
-   **Scalability**: Render provides options for scaling your application horizontally.
-   **Monitoring & Logging**: Utilize Render's built-in logging and monitoring tools.
-   **Security**: Ensure all dependencies are up-to-date, implement proper input sanitization, and secure API keys.
