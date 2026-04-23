# PlaceMentor-AI

PlaceMentor-AI is an AI-powered placement intelligence platform built with the MERN stack. It helps students assess and improve technical interview readiness through resume analysis, DSA tracking, mock interviews, coding profile insights, and personalized roadmaps.

## Project Structure

```text
PlaceMentor-AI/
  client/   # Vite + React frontend
  server/   # Express + MongoDB API
```

## Local Setup

1. Install frontend dependencies:

```bash
cd client
npm install
```

2. Install backend dependencies:

```bash
cd ../server
npm install
```

3. Create environment files from the examples:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

4. Start the backend:

```bash
cd server
npm run dev
```

5. Start the frontend:

```bash
cd client
npm run dev
```

## Required Environment Variables

Frontend (`client/.env`):

```env
VITE_BACKEND_URL=http://localhost:5000/api
```

Backend (`server/.env`):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Deploy To Vercel

Deploy this repo as two Vercel projects:

1. Backend API project

- Import the GitHub repo in Vercel.
- Set the project root directory to `server`.
- Add the backend environment variables from `server/.env.example`.
- Deploy and copy the production URL, for example `https://placementor-api.vercel.app`.
- Test `https://your-backend-url.vercel.app/api/health`.

2. Frontend project

- Import the same GitHub repo again in Vercel.
- Set the project root directory to `client`.
- Add `VITE_BACKEND_URL=https://your-backend-url.vercel.app/api`.
- Deploy the frontend.

The included `client/vercel.json` handles React Router refreshes, and `server/vercel.json` routes API requests to the Express app.

## GitHub Upload Checklist

- Do not commit `.env` files or `node_modules`; they are ignored by `.gitignore`.
- Commit `client/.env.example`, `server/.env.example`, and both `vercel.json` files.
- Push from the `PlaceMentor-AI` folder, which is the actual git repository.
