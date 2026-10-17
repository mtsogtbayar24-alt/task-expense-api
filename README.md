# Task Expense API
Tracks user expenses, calculates sums, and filters by category and date. All data stored in Postgres.
## Tech Stack
- Node.js / Express 5
- PostgreSQL (Docker)
- pg, dotenv

## Setup
1. git clone https://github.com/mtsogtbayar24-alt/task-expense-api.git
2. npm install
3. cp .env.example .env (then set DATABASE_URL in .env)
4. docker run -d --name taskpg -e POSTGRES_PASSWORD=tmpass 5432:5432 postgres:16
5. npm run dev  (or  npm start)

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
