# Bridal Store Sales Dashboard - V1

This full-stack dashboard was built to manage the sales module of a bridal store. It supports CSV imports, order management, refunds, and KPI visualization by period and source.

## Watch Demo

[![Watch the demo](./docs/demobridalstore.png)](https://drive.google.com/file/d/1jVdbclcMRgoo38yhVxuD-KKwOVt4_p2i/view?usp=sharing)


## About the Project

This full-stack dashboard was built to manage the sales module of a bridal store. In this first version, the system works directly with CSV file imports and focuses exclusively on online sales. The architecture was designed so it can be connected in the future to an external POS system if needed.

This V1 includes order management, refund handling, and general KPI visualization by month, quarter, semester, year, and source. Other modules, such as inventory, have not been included yet in this first release.

From a frontend perspective, the project was built with a responsive layout, reusable React components, CSS Modules, and a modern UI approach focused on clarity and usability.

## Built With

### Frontend
- React
- Vite
- JavaScript
- CSS Modules
- HTML5
- React Router

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Multer
- csv-parser

## Project Structure

- `frontend/` – React application
- `backend/` – Express API and Prisma logic
- `docs/` – demo image and sample CSV

## Features

- Import online sales from CSV files
- Group imported rows into orders and order items
- Calculate order status dynamically from item status
- Support item status: `PAID`, `REFUNDED`, `CANCELLED`, and `PENDING`
- Reflect partial order conditions such as `PARTIALLY_REFUNDED`, `PARTIALLY_CANCELLED`, `PARTIALLY_PENDING`
- Display sales KPIs by:
  - Month
  - Quarter
  - Semester
  - Annual
  - Source
- View a paginated orders table
- Search orders by customer name or order number
- Filter orders table by source and status
- Open order details in a side panel
- Show order items and order summary details
- Handle refund-related business logic through the system
- Use a responsive layout for desktop and smaller screens
- Built with reusable React components and CSS Modules

## What I Practiced

- Building a full-stack application with React, Vite, Express, Prisma, and PostgreSQL
- Designing a responsive dashboard layout with reusable React components
- Working with CSS Modules for scalable component-based styling
- Structuring frontend state for filters, pagination, period selection, and modal handling
- Connecting frontend and backend through REST API endpoints
- Building CSV import workflows with file upload, validation, parsing, and database persistence
- Grouping raw CSV rows into orders and order items
- Modeling real business logic with item-level and order-level statuses
- Creating helper functions to derive order summaries from item data
- Implementing search, filtering, pagination, and KPI calculations
- Working with Prisma models, migrations, enums, relations, and aggregate queries
- Debugging backend logic and aligning schema, endpoints, and frontend behavior

## Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### 2. Install dependencies

Frontend:
```bash
cd frontend
npm install
```
Backend:
```bash
cd ../backend
npm install
```

### 3. Set up environment variables

Create a `.env` file inside `backend/`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
PORT=3000
```
Create a .env file inside frontend/:
```env
VITE_API_URL=http://localhost:3000
```

### 4. Run database migrations

From backend/:
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start the development servers

Backend:
```bash
cd backend
npm run dev
```
Frontend:
```bash
cd frontend
npm run dev
```

### 6. Import sample data

A sample CSV file is included in `docs/sample-data/sample-data.csv` to test the import flow.

## Status

Version 1 completed.

This project is currently in its first functional release and focuses on the sales module of the system. At this stage, it supports online sales imports through CSV files, order and item processing, refund and cancellation logic, KPI visualization, filtering, search, and pagination.

This version was built as a practical and scalable foundation for future iterations. Planned improvements for later versions may include POS integration, inventory management, and expanded business modules.

## Author

## Author

**Norbelis L**  
Junior Web Developer focused on React, responsive interfaces, and growing into full-stack development.