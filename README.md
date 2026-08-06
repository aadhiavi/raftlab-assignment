# Food Delivery Order Management App

This is a Full-Stack Food Delivery application built for an assessment, featuring a beautiful UI, simulated real-time updates, and a Test-Driven Development (TDD) approach.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Vanilla CSS (with modern aesthetics and micro-animations), Vitest + React Testing Library (TDD).
- **Backend:** Node.js, Express, TypeScript, Jest (TDD), In-Memory Data Store (simulating a database).

## Features

1. **Menu Display:** Shows food items with images, descriptions, and prices.
2. **Order Placement:** Users can add items to a cart, enter delivery details, and checkout.
3. **Order Status:** Simulates real-time backend updates, automatically transitioning the order status from "Received" -> "Preparing" -> "Out for Delivery" -> "Delivered".
4. **TDD Coverage:** Unit tests for both client UI components and backend REST API endpoints.

## Local Setup

### 1. Backend

```bash
cd server
npm install
npm run dev
```

The server will run on `http://localhost:5000`.

### 2. Frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The client will run on the URL provided by Vite (usually `http://localhost:5173`).

## Running Tests

- **Backend:** `cd server && npm test`
- **Frontend:** `cd client && npm test`

## Deployment Instructions

### Deploying Frontend to Vercel/Netlify

1. Push this repository to GitHub.
2. Connect your GitHub account to Vercel or Netlify.
3. Import the `client` directory as a new project.
4. Set the build command to `npm run build` and the output directory to `dist`.
5. (Optional) In production, you would update the `fetch` calls in the frontend code to point to your deployed backend URL instead of `http://localhost:5000`.

### Deploying Backend to Render/Heroku

1. Connect your GitHub account to Render.
2. Create a new Web Service using the `server` directory.
3. Set the build command to `npm install && npm run build` and start command to `node dist/index.js`.
