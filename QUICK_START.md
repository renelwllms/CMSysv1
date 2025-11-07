# Quick Start Guide - Cafe Management System

## Prerequisites

Before starting, ensure you have:
- ✅ **Node.js** 18+ installed
- ✅ **PostgreSQL** 14+ installed
- ✅ **npm** (comes with Node.js)
- ✅ A code editor (VS Code recommended)

---

## Step 1: Install PostgreSQL

### Windows
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Set a password for the `postgres` user (remember this!)
4. Keep default port: **5432**
5. Install pgAdmin (included)

### Verify Installation
```bash
psql --version
```

---

## Step 2: Create Database

### Option A: Using pgAdmin
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name: `cafe_management`
5. Click "Save"

### Option B: Using Command Line
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cafe_management;

# Exit
\q
```

---

## Step 3: Configure Backend

### 1. Update Database Credentials

Edit `backend/.env` file:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cafe_management?schema=public"
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### 2. Install Dependencies

The dependencies should already be installed, but if not:

```bash
cd backend
npm install
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This creates all tables in your database.

### 5. Seed Database (Optional but Recommended)

```bash
npm run seed
```

This creates:
- 3 default users (admin, staff, kitchen)
- Sample menu items
- 10 sample tables
- Default system settings

---

## Step 4: Start Backend Server

```bash
npm run start:dev
```

You should see:
```
🚀 Server is running on: http://localhost:4000
📡 API available at: http://localhost:4000/api
📁 Uploads available at: http://localhost:4000/uploads
```

---

## Step 5: Test the API

### Quick Test with cURL

```bash
# Test server is running
curl http://localhost:4000/api

# Test login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@cafe.com\",\"password\":\"Admin123!\"}"

# Get menu items (public endpoint)
curl http://localhost:4000/api/menu
```

### Or use Postman/Thunder Client

Import the examples from `API_TESTING_GUIDE.md`

---

## Step 6: Verify Everything Works

### Default Users (after seeding):

| Role    | Email              | Password    |
|---------|-------------------|-------------|
| Admin   | admin@cafe.com    | Admin123!   |
| Staff   | staff@cafe.com    | Staff123!   |
| Kitchen | kitchen@cafe.com  | Kitchen123! |

### Test Checklist:

- [ ] Login as admin
- [ ] Get all menu items
- [ ] Create a new menu item
- [ ] Get all tables
- [ ] Create a new table (QR code auto-generated)
- [ ] Create an order (no auth required)
- [ ] Mark order as paid (staff)
- [ ] View kitchen orders (kitchen user)
- [ ] Update order status (kitchen)

---

## Common Issues & Solutions

### Issue: Cannot connect to PostgreSQL
**Solution:**
- Ensure PostgreSQL service is running
- Check Windows Services → PostgreSQL should be "Running"
- Verify port 5432 is not blocked

### Issue: Database connection error
**Solution:**
- Check `DATABASE_URL` in `.env` file
- Verify password is correct
- Ensure database `cafe_management` exists

### Issue: Prisma migrate fails
**Solution:**
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Or drop and recreate database
dropdb cafe_management
createdb cafe_management
npx prisma migrate dev --name init
```

### Issue: npm install fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install --legacy-peer-deps
```

### Issue: Port 4000 already in use
**Solution:**
- Change PORT in `.env` file to another port (e.g., 4001)
- Or kill the process using port 4000

---

## Development Workflow

### View Database

```bash
# Open Prisma Studio (visual database editor)
npx prisma studio
```

Opens at: http://localhost:5555

### Watch Logs

```bash
# Backend logs are shown in the terminal
npm run start:dev
```

### Update Database Schema

1. Edit `prisma/schema.prisma`
2. Run migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

### Reset Database (Development Only)

```bash
# ⚠️ WARNING: Deletes all data
npx prisma migrate reset
npm run seed
```

---

## Project Structure

```
cafesystemnove/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication
│   │   ├── menu/           # Menu management
│   │   ├── tables/         # Tables & QR codes
│   │   ├── orders/         # Order management
│   │   ├── tasks/          # Scheduled tasks
│   │   └── prisma/         # Database service
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   ├── uploads/            # Local file storage
│   └── .env                # Configuration
│
├── frontend/               # Next.js (to be built)
├── README.md
├── API_TESTING_GUIDE.md
└── QUICK_START.md (this file)
```

---

## What's Next?

Now that your backend is running, you can:

1. **Test the API** using the `API_TESTING_GUIDE.md`
2. **Build the frontend** with Next.js
3. **Customize** the system for your cafe
4. **Deploy** to production

---

## Useful Commands

```bash
# Backend Development
cd backend
npm run start:dev       # Start development server
npm run build           # Build for production
npm run start:prod      # Start production server

# Database
npx prisma studio       # Open visual DB editor
npx prisma migrate dev  # Create/apply migrations
npx prisma generate     # Generate Prisma Client
npm run seed            # Seed database

# View logs
npm run start:dev       # Logs shown in terminal
```

---

## Need Help?

- Check `README.md` for detailed documentation
- Review `API_TESTING_GUIDE.md` for API examples
- Check `Cafe_Management_System_Spec.md` for requirements
- Look at server logs for error messages

---

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Change all default user passwords
- [ ] Set `NODE_ENV=production`
- [ ] Use a production PostgreSQL server
- [ ] Enable HTTPS
- [ ] Set up proper backups
- [ ] Configure CORS for your domain
- [ ] Set up monitoring/logging
- [ ] Test all features thoroughly

---

🎉 **You're all set! Happy coding!**

For questions or issues, refer to the README.md or check the code comments.
