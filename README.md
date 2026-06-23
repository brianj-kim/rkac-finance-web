# RKAC Finance

## Problem
Treasurers need a reliable way to record weekly church income, manage donor/member information, and generate yearly donation receipts.

## My Role
Designed and implemented the application structure, database schema, income management workflow, receipt generation, and deployment pipeline.

## Key Features
- Admin authentication and role-based access control
- Member/donor management
- Income entry with filtering and search
- Yearly donation receipt PDF generation
- Bulk receipt generation
- PostgreSQL-backed data model
- GitHub Actions deployment workflow

## Architecture
[Frontend / Next.js App Router] → [Server Actions / API Routes] → [Prisma ORM] → [PostgreSQL]

## Screenshots
Add dashboard, income list, member page, receipt generation, and admin page screenshots.

## What I Learned
- Designing database-backed financial workflows
- Handling sensitive member/donation data
- Building PDF generation in a web app
- Structuring admin permissions and role-based access
- Deploying a production-style Next.js app
If you have Docker installed:

```bash
docker run --name rkac-postgres \
  -e POSTGRES_USER=rkac \
  -e POSTGRES_PASSWORD=rkac_password \
  -e POSTGRES_DB=rkac_finance \
  -p 5432:5432 \
  -d postgres:16
```

> You can change the username/password/db name as you like. Just keep your `.env` in sync.

### 3) Configure environment variables

Create a `.env` file at the project root:

```env
DATABASE_URL="postgresql://rkac:rkac_password@localhost:5432/rkac_finance?schema=public"
```

### 4) Run Prisma migration + generate client

If this repo contains migrations:

```bash
pnpm prisma migrate dev
```

If you are using an existing database schema and do not have migrations:

```bash
pnpm prisma db pull
pnpm prisma generate
```

### 5) Run the dev server

```bash
pnpm dev
```

Open:

* [http://localhost:3000/income](http://localhost:3000/income)

---

## Scripts

Common commands:

```bash
pnpm dev             # start dev server
pnpm build           # build for production
pnpm start           # run production build
pnpm lint            # run lint
pnpm prisma studio   # open Prisma Studio (DB viewer)
```

---

## Receipt PDFs (Local)

When generating receipts, PDF files are saved under:

```
/public/receipts/<taxYear>/
```

and the database stores a URL like:

```
/receipts/<taxYear>/receipt-<taxYear>-00001.pdf
```

> Note: If you deploy to a serverless environment with a read-only filesystem, you’ll need to store PDFs in object storage (S3/R2/etc.) instead of writing to `/public`.

---

## Database Notes

This project uses PostgreSQL 16+.

Schema and models live in:

* `prisma/schema.prisma`

Prisma client is generated automatically via:

* `postinstall`: `prisma generate`

---

## Security / Privacy

* This project stores member and donation information.
* Do **not** commit real member data or secrets.
* Keep `.env` private (already included in `.gitignore`).

---

## Contributing

This is currently a church internal project MVP. Suggestions and improvements are welcome:

1. Fork the repo
2. Create a feature branch
3. Submit a pull request

---

## License

Creative Commons CC0-1.0

---

## Disclaimer

This app helps generate donation receipts based on stored records.
Please verify receipt formatting and requirements against CRA guidance and your church’s policies.

```
```
