# E-Commerce Service

A modern e-commerce platform built with Next.js, featuring an AI product recommendation system, admin dashboard, and user authentication.

## Features

- **User Authentication** - Secure login and registration
- **Product Catalog** - Browse and search products
- **Shopping Cart** - Add and manage items
- **Checkout Process** - Complete order placement
- **Admin Dashboard** - Manage products, orders, and campaigns
- **AI Recommendations** - Machine learning-based product suggestions
- **Order Tracking** - Monitor order status
- **Data Visualization** - Sales and inventory analytics

## Tech Stack

- **Frontend:** Next.js, React, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with bcrypt password hashing
- **Charts:** Recharts
- **UI Components:** Radix UI
- **ML Model:** Python, scikit-learn, Flask

## Prerequisites

- Node.js (v18.0.0 or later)
- Python (v3.8 or later)
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd ecom-service
```

2. **Install Node.js dependencies:**

```bash
npm install
# or
yarn install
```

3. **Set up the database:**

Create a PostgreSQL database and add the connection string to your environment variables.

4. **Configure environment variables:**

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/ecom_service"
DIRECT_URL="postgresql://username:password@localhost:5432/ecom_service"
JWT_SECRET="your-secret-key"
```

5. **Initialize the database:**

```bash
npx prisma migrate dev --name init
```

6. **Install Python dependencies for the AI model:**

```bash
pip install -r AI-model/requirements.txt
```

## Running the Application

You can start all services with the provided batch script:

```bash
start-all.bat
```

Or start the services individually:

1. **Start the AI model server:**

```bash
cd AI-model
python app.py
```

This will start the Flask API on http://localhost:5000

2. **Start the Next.js development server:**

```bash
npm run dev
```

This will start the Next.js app on http://localhost:3000

## Usage

### Customer Interface

- Visit `http://localhost:3000` to browse the store
- Create an account or log in to place orders
- View product details and recommendations
- Add items to cart and check out

### Admin Interface

- Log in with admin credentials
- Visit `http://localhost:3000/admin/dashboard` to access the admin panel
- Manage products, orders, customers, and campaigns
- View sales analytics and reports

## Development

- **Run tests:**

```bash
npm run test
```

- **Build for production:**

```bash
npm run build
```

- **Start production server:**

```bash
npm start
```
