# Project Overview: Delicias E-commerce Application

This project is a full-stack e-commerce application.

## Key Technologies:

*   **Frontend:** React.js (with JSX), Vite for bundling, Tailwind CSS for styling, and a component library resembling Shadcn UI (found in `src/components/ui`).
*   **Backend:** Node.js server (likely Express.js, indicated by `server.js`).
*   **Database:** SQLite (indicated by `database.sqlite`).
*   **API Client:** `src/api/localApiClient.js` handles communication between frontend and backend.

## Core Functionality:

*   **E-commerce:** Product display, shopping cart, checkout process.
*   **Admin Panel:** Product management (add, list), settings, and statistics.

## Project Structure & Conventions:

*   **Components:** Organized by feature (e.g., `admin`, `cart`, `home`, `products`) and a shared `ui` directory for reusable components.
*   **Pages:** Main application views are in `src/pages`.
*   **Utilities & Hooks:** Common functions and custom React hooks are in `src/lib`, `src/utils`, and `src/hooks`.
*   **Styling:** Utilizes Tailwind CSS for utility-first styling.

## Development Environment:

*   **Package Manager:** npm (indicated by `package.json`, `package-lock.json`).
*   **Linting:** ESLint (`eslint.config.js`).
*   **JavaScript Configuration:** `jsconfig.json`.

## How to Run (Inferred):

1.  **Install Dependencies:** `npm install`
2.  **Start Backend Server:** `node server.js` (or a similar command if a process manager is used).
3.  **Start Frontend Development Server:** `npm run dev` (common Vite command).

This `GEMINI.md` aims to provide a quick reference for understanding the project's architecture and conventions, facilitating future interactions.