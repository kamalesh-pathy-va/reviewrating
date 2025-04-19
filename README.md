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

## Permission and Feature list

| Pages | Visitor | User | Brand owner | Moderater | Admin | Status |
|:--------|:-------:|:----:|:-----:|:---------:|:-----:|:------:|
| Home page | ✅ | ✅ | ✅ | ✅ | ✅ | Completed |
| All Brands | ❌ | ✅ | ✅ | ✅ | ✅ | Completed |
| Specific Brand | 🟧 | ✅ | ✅ | ✅ | ✅ | Completed |
| New brand | ❌ | ✅ | ✅ | ✅ | ✅ | Not Developed |
| All Products | ✅ | ✅ | ✅ | ✅ | ✅ | Completed |
| Specific Product | 🟧 | ✅ | ✅ | ✅ | ✅ | Completed |
| New Product | ❌ | ✅ | ✅ | ✅ | ✅ | Completed |
| Login | ✅ | ❌ | ❌ | ❌ | ❌ | Completed |
| Sign up | ✅ | ❌ | ❌ | ❌ | ❌ | Completed |
| User Profile | ❌ | ✅ | 🟧 | 🟧 | 🟧 | Completed |


| Features | Visitor | User | Brand owner | Moderater | Admin | Status |
|:--------|:-------:|:----:|:-----:|:---------:|:-----:|:------:|
| Search | ✅ | ✅ | ✅ | ✅ | ✅ | Completed |
| Login | ✅ | ❌ | ❌ | ❌ | ❌ | Completed |
| Sign up | ✅ | ❌ | ❌ | ❌ | ❌ | Completed |
| Logout | ❌ | ✅ | ✅ | ✅ | ✅ | Completed |
| Profile update | ❌ | ✅ | ❌ | ❌ | ❌ | Completed |
| **Brand** |
| Create new brand | ❌ | ✅ | ✅ | ✅ | ✅ | In Dev |
| View Unverified brand | ❌ | ❌ | ✅ | ✅ | ✅ | Completed |
| View Verified brand | ❌ | ✅ | ✅ | ✅ | ✅ | Completed |
| View a brand | ❌ | ✅ | ✅ | ✅ | ✅ | Completed |
| (Un)Verify a brand | ❌ | ❌ | ❌ | ✅ | ✅ | In Dev |
| Update a brand | ❌ | ❌ | ✅ | ✅ | ✅ | Not Developed |
| Delete a brand | ❌ | ❌ | ✅ | ❌ | ✅ | Not Developed |
| **Product** |
| Create new product |  ❌ | ✅ | ✅ | ✅ | ✅ | Completed |
| View all products | ✅ | ✅ | ✅ | ✅ | ✅ | Completed 
| View a product | 🟧 | ✅ | ✅ | ✅ | ✅ | Completed |
| (Un)Verify a product |  ❌ | ❌ | ✅ | ✅ | ✅ | Completed |
| Update a product |  ❌ | 🟧 | ✅ | ✅ | ✅ | In Dev |
| Delete a product |  ❌ | 🟧 | ✅ | 🟧 | ✅ | Completed |
| Merge a product |  ❌ | ❌ | ✅ | ❌ | ❌ | In Dev |
| **Reviews** |
| Create new review | ❌ | ✅ | ✅ | ✅ | ✅ | Completed |
| View reviews | ❌ | ✅ | ✅ | ✅ | ✅ | Completed |
| Update a review | ❌ | ✅ | ❌ | ❌ | ❌ | Completed |
| Flag a review | ❌ | ❌ | ✅ | ✅ | ✅ | In Dev |
| Delete a review | ❌ | ✅ | ❌ | ❌ | ✅ | In Dev |

