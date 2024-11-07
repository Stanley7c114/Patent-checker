# Patent Infringement Checker

A web application that analyzes potential patent infringements by comparing patent claims against company products.

## Project Structure

```
patent-checker/
├── client/ # React frontend
├── server/ # Express backend
└── docker-compose.yml
```

## Running Locally (Without Docker)

### Prerequisites

1. **Create a `.env` File**

   Before starting the server, create a `.env` file in the `server` directory and add your Gemini API key:

   ```plaintext
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### 1. Start the Backend Server

```bash
# Navigate to server directory
cd server
# Install dependencies
npm install
# Start the server
npm start
```

Server will run on http://localhost:3000

### 2. Start the Frontend Application

```bash
# Open a new terminal
# Navigate to client directory
cd client
# Install dependencies
npm install
# Start the development server
npm run dev
```

Frontend will run on http://localhost:5173

## Running with Docker

### 1. Build and Start the Containers

```bash
# From the root directory
docker-compose up --build
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### 2. Stop the Containers

```bash
docker-compose down
```

## Usage

1. Open http://localhost:5173 in your browser
2. Enter a patent ID (e.g., "US-RE49889-E1")
3. Enter a company name (e.g., "Walmart Inc.")
4. Click "Check Infringement"

## Example Input

Patent ID: US-RE49889-E1  
Company Name: Walmart Inc.

## Development

### Backend API Endpoints

- `POST /api/infringement-check`
  - Request body:
    ```json
    {
      "patentId": "US-RE49889-E1",
      "companyName": "Walmart Inc."
    }
    ```

### Available Scripts

**Backend:**

```bash
npm start # Start the server
```

**Frontend:**

```bash
npm run dev # Start development server
```
