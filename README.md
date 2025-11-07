# Cafe Management System

A comprehensive mobile-friendly Cafe Management System designed for cafés in Indonesia with QR code ordering, multi-language support (English & Bahasa Indonesia), and complete kitchen workflow management.

## Features

- **Customer Self-Ordering** via QR code (no login required)
- **Multi-language Support** (English & Bahasa Indonesia)
- **Menu Management** with categories (Drinks, Main Foods, Snacks, Cabinet Food, Cakes, Gifts)
- **Cake Pre-ordering** with down payment system
- **Kitchen Workflow** tracking (Waiting → Cooking → Completed)
- **Staff Management** with role-based access (Admin, Staff, Kitchen)
- **Dashboard & Analytics** for revenue tracking and insights
- **Auto-clear Logic** for unpaid orders
- **Local File Storage** for images
- **Real-time Updates** via Socket.io

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **Zustand** for state management
- **next-intl** for internationalization

### Backend
- **NestJS** (TypeScript)
- **Prisma ORM**
- **PostgreSQL** (local database)
- **JWT Authentication**
- **Socket.io** for real-time updates
- **Multer** for file uploads

## Project Structure

```
cafesystemnove/
├── backend/                 # NestJS backend
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── menu/           # Menu management
│   │   ├── orders/         # Order processing
│   │   ├── payments/       # Payment handling
│   │   ├── tables/         # Table & QR code management
│   │   ├── settings/       # System settings
│   │   └── dashboard/      # Analytics & reports
│   ├── uploads/            # Local file storage
│   └── .env                # Environment variables
│
├── frontend/               # Next.js frontend
│   ├── app/
│   │   ├── [locale]/      # Internationalized routes
│   │   ├── admin/         # Admin dashboard
│   │   ├── staff/         # Staff interface
│   │   ├── kitchen/       # Kitchen screen
│   │   └── order/         # Public ordering page
│   ├── components/
│   ├── lib/
│   └── public/
│
└── Cafe_Management_System_Spec.md  # Full specification
```

## Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **PostgreSQL** 14+ (installed locally)
- **Git** (optional)

## Setup Instructions

### 1. Database Setup

First, create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cafe_management;

# Exit psql
\q
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies (if not already installed)
npm install

# Update .env file with your database credentials
# Edit backend/.env and update DATABASE_URL

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database (optional - creates default admin user)
npm run seed

# Start backend server
npm run start:dev
```

Backend will run on `http://localhost:4000`

### 3. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## Default Admin Credentials

After running the seed script:

- **Email:** admin@cafe.com
- **Password:** Admin123!

**⚠️ Change these credentials immediately in production!**

## API Documentation

Once the backend is running, visit:
- Swagger API Docs: `http://localhost:4000/api/docs`

## Key Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - Register new staff/kitchen user (Admin only)

### Menu
- `GET /menu` - Get all menu items (public)
- `POST /menu` - Create menu item (Staff/Admin)
- `PUT /menu/:id` - Update menu item
- `DELETE /menu/:id` - Delete menu item

### Orders
- `POST /orders` - Create customer order (public)
- `GET /orders` - Get all orders (Staff/Admin)
- `GET /orders/kitchen` - Get orders for kitchen
- `PATCH /orders/:id/status` - Update order status
- `PATCH /orders/:id/payment` - Mark order as paid

### Tables & QR Codes
- `GET /tables` - List all tables
- `POST /tables` - Create new table with QR code
- `GET /tables/:id/qr` - Download QR code image

## Database Schema

The database includes the following main tables:

- **User** - Admin, Staff, Kitchen users
- **MenuItem** - Menu items with multi-language support
- **Table** - Tables with QR codes
- **Order** - Customer orders
- **OrderItem** - Items in each order
- **Payment** - Payment records
- **Settings** - System-wide settings

See `backend/prisma/schema.prisma` for the complete schema.

## Development Workflow

### Running Both Servers Concurrently

```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Database Migrations

```bash
cd backend

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

## Deployment

### Backend Deployment (Self-hosted)

1. Set up PostgreSQL on your server
2. Clone the repository
3. Configure environment variables
4. Run migrations
5. Build and start the application

```bash
npm run build
npm run start:prod
```

### Frontend Deployment

The frontend can be deployed to Vercel, Netlify, or self-hosted.

```bash
npm run build
npm run start
```

## Environment Variables

### Backend (.env)

```
DATABASE_URL="postgresql://user:password@localhost:5432/cafe_management"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=4000
FRONTEND_URL="http://localhost:3000"
UPLOAD_PATH="./uploads"
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists
- Check PostgreSQL user permissions

### Port Already in Use

```bash
# Change PORT in backend/.env
# Or kill process using the port
npx kill-port 4000
```

### Prisma Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database
npx prisma migrate reset
```

## Future Enhancements

- Loyalty program
- Push notifications
- Online delivery mode
- POS integration
- Offline mode support
- WhatsApp integration

## License

MIT

## Support

For issues and questions, please check the specification document or create an issue in the repository.
