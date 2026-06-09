# RefundGuard Frontend

RefundGuard is a React + Vite frontend for an AI-powered e-commerce refund support agent. The frontend provides a customer-facing chat interface, an admin trace dashboard, reset controls for repeatable demos, and a floating mini chat widget.

## Features

* Customer chat interface for submitting refund requests
* Scenario buttons for common test cases:

  * Approved refund
  * Duplicate refund
  * Final sale / policy pressure
  * High-value escalation
  * Invalid order / retry
* Admin dashboard for reviewing agent traces
* Trace details showing tool input/output, latency, retries, decisions, and token usage
* Reset buttons for refunds and traces
* Floating mini chat widget available across the app
* Black and red dashboard-style UI

## Tech Stack

* React
* Vite
* Axios
* Lucide React icons
* CSS modules/global styling

## Repository Structure

```text
frontend/
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── MiniChatWidget.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── README.md
```

## Key Files

### `src/App.jsx`

Main application component. Handles:

* Chat interface
* Admin dashboard
* Scenario buttons
* API calls to the backend
* Trace display
* Reset refund and reset trace controls

### `src/App.css`

Main styling file for the application. Defines the black/red theme, sidebar layout, chat interface, admin dashboard, trace cards, buttons, and responsive styling.

### `src/MiniChatWidget.jsx`

Floating mini chat widget that reuses the backend `/api/chat` endpoint. It allows users to interact with the refund assistant while navigating other parts of the app.

### `src/index.css`

Global app reset and root-level styling.

## Environment Variables

Create a `.env` file in the frontend project if deploying:

```env
VITE_API_URL=https://your-backend-url.com
```

For local development, the app falls back to:

```text
http://localhost:5000
```

## Running Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will usually run at:

```text
http://localhost:5173
```

## Deployment Notes

This frontend can be deployed as a static site on Render, Vercel, Netlify, or similar platforms.

For Render Static Site:

```text
Build Command: npm install && npm run build
Publish Directory: dist
```

Make sure `VITE_API_URL` points to the deployed backend service.

