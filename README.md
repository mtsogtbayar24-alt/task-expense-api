# Task Expense API
<this system is trackeng the user expenses, calculate the sum and filter with category and date all process will be saved on Postgres.>

## Tech Stack
- Node.js / Express 5
- PostgreSQL (Docker)
- pg, dotenv

## Setup
1. git clone ...
2. npm install
3. cp .env.example .env (DATABASE_URL=postgres://postgres:tmpass@localhost:5432/postgres)
4. docker run -d --name taskpg -e POSTGRES_PASSWORD=tmpass -p 5432:5432 postgres:16
5. npm run dev  (эсвэл npm start)

## API
| Method | Path            | Description        |
|--------|-----------------|--------------------|
| GET    | /health         | Health check       |
| GET    | /expenses       | List all expenses  |
| POST   | /expenses       | Create an expense  |
| GET    | /expenses/:id   | Get expense by id  |

## Examples
curl -s http://localhost:3000/health
curl -s -X POST http://localhost:3000/expenses -H "Content-Type: application/json" -d '{"title":"Coffee","amount":5000,"category":"food"}'
curl -s http://localhost:3000/expenses/1
