# Database Setup Guide for TyreHiTyre.com

## Option 1: Vercel Postgres (Recommended for Free Tier)

1. **Add Vercel Postgres Database**:
   - Go to Vercel Dashboard → Storage → Create Database
   - Choose "Postgres" (free tier includes 1GB)
   - Select your region (closest to your users)
   - Click "Create Database"

2. **Get Database Connection String**:
   - In Vercel Storage, click on your database
   - Go to ".env.local" tab
   - Copy the `DATABASE_URL` value

3. **Update Environment Variables**:
   - In Vercel project settings → Environment Variables
   - Add `DATABASE_URL` with your connection string
   - Add `NEXTAUTH_SECRET` with a random string (generate with: `openssl rand -base64 32`)
   - Add `NEXTAUTH_URL` with your Vercel URL

## Option 2: External PostgreSQL (For Production)

1. **Create PostgreSQL Database**:
   ```bash
   # Using Docker (recommended)
   docker run --name postgres-db \
     -e POSTGRES_PASSWORD=yourpassword \
     -e POSTGRES_DB=tyrehityre \
     -p 5432:5432 \
     -v postgres_data:/var/lib/postgresql \
     postgres:15
   ```

2. **Database Connection String**:
   ```
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/tyrehityre"
   ```

## Option 3: Railway PostgreSQL (Easy Alternative)

1. **Create Railway Account**: https://railway.app
2. **New Project**: Choose PostgreSQL
3. **Get Connection String**: From Railway dashboard
4. **Update Environment Variables**: Same as Option 1

## Database Migration

After setting up the database:

1. **Generate Prisma Client**:
   ```bash
   bun run db:generate
   ```

2. **Push Schema**:
   ```bash
   bun run db:push
   ```

3. **Run Seed Script**:
   ```bash
   bun run seed
   ```

## Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-random-secret-here"

# Node.js
NODE_ENV="production"
```

## Troubleshooting

### Database Connection Errors
- Ensure DATABASE_URL is correct format
- Check database is running and accessible
- Verify network connectivity

### Prisma Errors
- Run `bun run db:generate` after schema changes
- Run `bun run db:push` to apply schema changes
- Check Prisma schema syntax

### Vercel Deployment Issues
- Check environment variables in Vercel dashboard
- Ensure build includes `bun run db:generate`
- Check Vercel function logs for errors