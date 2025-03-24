# Review and Rating

## Pre-requisites

- This project uses PostgreSQL for database, can use any free online service to host the DB, or set it up in local.


## Steps to setup in local

1. Clone this project
2. Run `npm install`
3. Create a `.env` file and add the following 2 variable:
    - DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
    - JWT_SECRET="randomString"
4. Apply the existing migration with `npx prisma migrate dev`
5. Verify the DB creation with `npx prisma studio`, go to `localhost:5555` and look for the following tables:
    - Brand
    - BrandUser
    - Product
    - Review
    - User
    - UserRole
6. Run `npm run dev` to start the development server
7. Go to `localhost:3000`

---
