# Expense Splitter Backend API

A robust, production-ready REST API for managing expense splitting between friends and roommates. Built with Node.js, Express, Prisma ORM, and MariaDB with comprehensive validation, error handling, and intelligent balance calculations.

## ✨ Features

- **👥 User Management** — Create, retrieve, and manage user profiles with phone number validation
- **💰 Expense Tracking** — Create and store expenses with flexible participant management
- **⚖️ Smart Balance Calculation** — Automatic net balance computation with optimal settlement suggestions
- **🔄 Participation Tracking** — Track who owes whom with precise share calculations
- **✅ Input Validation** — Comprehensive validation on all endpoints with clear error messages
- **📊 Balance Sheet** — Complete balance overview identifying creditors and debtors
- **🐛 Error Handling** — Structured error responses with Winston logging for debugging
- **🚀 Production Ready** — Optimized for scalability with modular architecture

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v16 or higher ([download here](https://nodejs.org/))
- **npm** v7 or higher (comes with Node.js)
- **MariaDB** 10.5+ or **MySQL** 8.0+ ([download here](https://mariadb.org/))
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-splitter-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
LOG_LEVEL=info

# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/expense_splitter"

# Optional: CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Important:** Replace `username` and `password` with your MariaDB credentials.

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create database schema
npx prisma migrate dev

# (Optional) Seed database with sample data
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

**Tip:** The development server includes hot-reload. Changes to files automatically restart the server.

## 📁 Project Structure

```
expense-splitter-backend/
├── src/
│   ├── controllers/
│   │   ├── userController.js         # User management logic
│   │   ├── expenseController.js      # Expense creation and retrieval
│   │   └── participationController.js # Participation tracking logic
│   ├── routes/
│   │   ├── userRoutes.js             # User endpoints
│   │   ├── expenseRoutes.js          # Expense endpoints
│   │   └── participationRoutes.js    # Participation endpoints
│   ├── middleware/
│   │   ├── errorHandler.js           # Global error handling
│   │   ├── validation.js             # Input validation middleware
│   │   └── cors.js                   # CORS configuration
│   ├── utils/
│   │   ├── logger.js                 # Winston logging configuration
│   │   ├── balanceCalculator.js      # Balance computation logic
│   │   └── validators.js             # Validation helper functions
│   ├── prisma/
│   │   └── schema.prisma             # Database schema definition
│   ├── server.js                     # Express app initialization
│   └── index.js                      # Application entry point
├── prisma/
│   └── migrations/                   # Database migration files
├── .env                              # Environment variables (not in git)
├── .env.example                      # Example environment file
├── package.json
├── prisma.schema                     # Prisma ORM configuration
└── README.md                         # This file
```

## ⚡ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload (nodemon) |
| `npm start` | Start production server |
| `npm run prisma:migrate` | Run pending database migrations |
| `npm run prisma:generate` | Generate/regenerate Prisma client |
| `npm run prisma:studio` | Open Prisma Studio for database inspection |
| `npm run lint` | Run ESLint code quality checks |
| `npm run format` | Format code with Prettier |

## 🔌 API Endpoints

### Health Check

**GET** `/api/health`

Check if the API is running and responsive.

```bash
curl http://localhost:5000/api/health
```

**Response (200):**
```json
{
  "status": "Server is running",
  "timestamp": "2025-11-07T06:12:36.786Z"
}
```

### Users Management

#### Get All Users

**GET** `/api/users`

Retrieve a list of all users in the system.

```bash
curl http://localhost:5000/api/users
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "phoneNumber": "+1234567890",
      "createdAt": "2025-11-07T06:12:36.786Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "phoneNumber": "+1234567891",
      "createdAt": "2025-11-07T06:12:40.125Z"
    }
  ]
}
```

#### Create New User

**POST** `/api/users`

Create a new user in the system.

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phoneNumber": "+1234567890"
  }'
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phoneNumber": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "createdAt": "2025-11-07T06:12:36.786Z"
  }
}
```

**Validation Rules:**
- `name`: Required, 2-50 characters
- `phoneNumber`: Optional, valid phone format

### Expenses Management

#### Get All Expenses

**GET** `/api/expenses`

Retrieve all expenses with complete details including payer and participants.

```bash
curl http://localhost:5000/api/expenses
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Dinner at Restaurant",
      "amount": 1500,
      "payerId": 1,
      "createdAt": "2025-11-07T06:13:17.938Z",
      "payer": {
        "id": 1,
        "name": "John Doe"
      },
      "participants": [
        {
          "id": 44,
          "userId": 1,
          "share": 375,
          "user": {
            "id": 1,
            "name": "John Doe"
          }
        },
        {
          "id": 45,
          "userId": 2,
          "share": 375,
          "user": {
            "id": 2,
            "name": "Jane Smith"
          }
        }
      ]
    }
  ]
}
```

#### Create New Expense

**POST** `/api/expenses`

Create a new expense and automatically split it among participants.

```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dinner at Restaurant",
    "amount": 1500,
    "payerId": 1,
    "participantIds": [1, 2, 3, 4]
  }'
```

**Request Body:**
```json
{
  "title": "Dinner at Restaurant",
  "amount": 1500,
  "payerId": 1,
  "participantIds": [1, 2, 3, 4]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": 16,
    "title": "Dinner at Restaurant",
    "amount": 1500,
    "payerId": 1,
    "createdAt": "2025-11-07T06:13:17.938Z",
    "payer": {
      "id": 1,
      "name": "John Doe",
      "phoneNumber": "+1234567890"
    },
    "participants": [
      {
        "id": 44,
        "userId": 1,
        "share": 375,
        "user": {
          "id": 1,
          "name": "John Doe"
        }
      },
      {
        "id": 45,
        "userId": 2,
        "share": 375,
        "user": {
          "id": 2,
          "name": "Jane Smith"
        }
      }
    ]
  }
}
```

**Features:**
- Payer is automatically included in participants (no need to specify)
- Duplicate participant IDs are automatically removed
- Amount is split equally among all participants
- All user IDs are validated before creation

**Validation Rules:**
- `title`: Required, 2-100 characters
- `amount`: Required, positive number with up to 2 decimal places
- `payerId`: Required, must be valid user ID
- `participantIds`: Required array, minimum 1 participant

#### Get Balance Sheet

**GET** `/api/expenses/balance`

Calculate and retrieve complete balance information, including creditors, debtors, and settlement transactions.

```bash
curl http://localhost:5000/api/expenses/balance
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "from": "User A",
        "fromId": 1,
        "to": "User B",
        "toId": 2,
        "amount": 250.50
      },
      {
        "from": "User C",
        "fromId": 3,
        "to": "User B",
        "toId": 2,
        "amount": 120.75
      }
    ],
    "creditors": [
      {
        "id": 2,
        "name": "User B",
        "phoneNumber": "+1234567890",
        "amount": 371.25
      }
    ],
    "debtors": [
      {
        "id": 1,
        "name": "User A",
        "phoneNumber": "+1234567891",
        "amount": 250.50
      },
      {
        "id": 3,
        "name": "User C",
        "phoneNumber": "+1234567892",
        "amount": 120.75
      }
    ],
    "summary": {
      "totalSettlement": 371.25,
      "totalTransactions": 2
    }
  }
}
```

### Participations

#### Get All Participations

**GET** `/api/participations`

Retrieve all expense participations with user and expense details.

```bash
curl http://localhost:5000/api/participations
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "expenseId": 1,
      "userId": 1,
      "share": 375,
      "user": {
        "id": 1,
        "name": "John Doe"
      },
      "expense": {
        "id": 1,
        "title": "Dinner",
        "amount": 1500
      }
    }
  ]
}
```

## 📊 Data Models

### User Model

```javascript
{
  id: Int (Auto-increment),
  name: String (Required, 2-50 characters),
  phoneNumber: String (Optional),
  createdAt: DateTime (Auto-set),
  expenses: Expense[] (Inverse relation),
  participations: Participation[] (Inverse relation)
}
```

### Expense Model

```javascript
{
  id: Int (Auto-increment),
  title: String (Required, 2-100 characters),
  amount: Float (Required, positive),
  payerId: Int (Foreign Key to User, required),
  createdAt: DateTime (Auto-set),
  payer: User (Relation),
  participants: Participation[] (Relation)
}
```

### Participation Model

```javascript
{
  id: Int (Auto-increment),
  expenseId: Int (Foreign Key to Expense, required),
  userId: Int (Foreign Key to User, required),
  share: Float (Calculated share amount),
  expense: Expense (Relation),
  user: User (Relation)
}
```

## 🔧 Smart Features

### Automatic Participant Inclusion

When creating an expense, the payer is automatically included in the participant list. This ensures proper accounting:

- Duplicate participant IDs are removed automatically
- All user IDs are validated before expense creation
- The payer cannot be "left out" of their own expense

### Intelligent Balance Calculation

The balance calculation algorithm provides optimal settlement information:

- **Net Balance Computation** — Calculates each user's net balance (positive = owed money, negative = owes money)
- **Creditor/Debtor Identification** — Separates users into creditors and debtors
- **Settlement Transactions** — Generates minimal transaction set needed to settle all debts
- **Precision Handling** — Handles floating-point precision issues for accurate calculations

### Example Scenario

Three users go to dinner (total: $150):
- Alice pays $150
- Participants: Alice, Bob, Charlie (split: $50 each)

**Balance Calculation:**
- Alice: +$100 (paid extra $50 + owes nothing)
- Bob: -$50 (owes $50)
- Charlie: -$50 (owes $50)

**Settlement Transaction:**
- Bob pays Alice $50
- Charlie pays Alice $50

## 🔒 Validation Rules

### User Creation Validation

| Field | Rules |
|-------|-------|
| `name` | Required, 2-50 characters, letters and spaces only |
| `phoneNumber` | Optional, valid international phone format |

### Expense Creation Validation

| Field | Rules |
|-------|-------|
| `title` | Required, 2-100 characters |
| `amount` | Required, positive number, max 2 decimal places |
| `payerId` | Required, must reference existing user |
| `participantIds` | Required array, minimum 1 user, all valid user IDs |

## 🛠️ Error Handling

### Error Response Format

All errors follow a consistent response structure:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Common Error Codes

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Validation Error | Invalid input data |
| 400 | User Not Found | Referenced user IDs don't exist |
| 404 | Not Found | Requested resource doesn't exist |
| 500 | Server Error | Internal server error |

### Error Response Examples

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Expense title is required",
  "errors": ["Title must be between 2-100 characters"]
}
```

**Invalid User IDs (400):**
```json
{
  "success": false,
  "message": "Invalid user IDs: 99, 100",
  "errors": ["Users with IDs 99, 100 do not exist"]
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Error computing balance sheet",
  "errors": ["Internal server error"]
}
```

## 🐛 Troubleshooting

### Database Connection Error

**Problem:** Connection refused when starting server

**Solution:**
```bash
# Check if MariaDB/MySQL service is running
sudo systemctl status mariadb

# Start the service if not running
sudo systemctl start mariadb

# Verify database credentials
mysql -u username -p -h localhost expense_splitter

# Check DATABASE_URL in .env file
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find and kill the process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=5001 npm run dev
```

### Prisma Client Issues

**Problem:** Prisma client not found or out of sync

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Clear cache and reinstall
rm -rf node_modules
npm install
```

### Migration Issues

**Problem:** Pending migrations or schema mismatch

**Solution:**
```bash
# Check migration status
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy

# View database schema
npx prisma studio
```

### CORS Errors

**Problem:** Frontend requests blocked due to CORS

**Solution:**
```env
# Update .env file
CORS_ORIGIN=http://localhost:5173

# Or for multiple origins
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## 📈 Production Deployment

### Environment Configuration

Create a `.env` file for production with these variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000
LOG_LEVEL=warn

# Database Configuration
DATABASE_URL="mysql://prod_user:secure_password@production-db:3306/expense_splitter"

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com
```

### Using PM2 Process Manager (Recommended)

PM2 keeps your application running and handles automatic restarts:

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start src/index.js --name "expense-splitter"

# Set PM2 to auto-start on system reboot
pm2 startup

# Monitor running processes
pm2 monit

# View logs
pm2 logs expense-splitter
```

### Using Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t expense-splitter-backend .
docker run -p 5000:5000 --env-file .env expense-splitter-backend
```

### Performance Optimization

- Use connection pooling for database connections
- Enable query caching where appropriate
- Set appropriate `LOG_LEVEL=warn` for production
- Monitor database query performance
- Use a reverse proxy (Nginx) for load balancing

## 🔄 Data Flow Examples

### Expense Creation Flow

1. **Validation** — Validate title, amount, payerId, and participantIds
2. **Payer Inclusion** — Automatically add payer to participant list
3. **Deduplication** — Remove duplicate participant IDs
4. **User Verification** — Verify all user IDs exist in database
5. **Share Calculation** — Calculate equal share for each participant (amount ÷ participant count)
6. **Record Creation** — Create expense record and participation entries
7. **Response** — Return complete expense data with all participants

### Balance Calculation Flow

1. **Fetch All Expenses** — Retrieve all expenses with participants
2. **Accumulate Shares** — Calculate total share for each user
3. **Net Balance** — Compute net balance (paid - owes)
4. **Identify Roles** — Separate users into creditors and debtors
5. **Generate Transactions** — Create minimal settlement transaction set
6. **Compute Summary** — Calculate total settlement and transaction count
7. **Return Results** — Provide complete balance information

## 🎯 Key Benefits

- **RESTful Design** — Predictable, clean API endpoints following REST conventions
- **Data Integrity** — Comprehensive validation and error handling
- **Performance** — Optimized database queries with Prisma ORM
- **Scalability** — Modular architecture for easy feature expansion
- **Security** — Input validation, CORS configuration, and error handling
- **Logging** — Winston logging for debugging and monitoring
- **Type Safety** — Prisma schema ensures data consistency
- **Documentation** — Clear responses and detailed error messages

## 🤝 Integration with Frontend

This backend seamlessly integrates with the Expense Splitter Frontend:

- **Real-time Expense Tracking** — Frontend receives instant expense updates
- **Automatic Balance Calculations** — Balance page displays live settlement data
- **User Management** — Create and manage users across both applications
- **Error Feedback** — Structured errors support toast notifications
- **Responsive Design** — API supports mobile and desktop clients

**Frontend Repository:** [Expense Splitter Frontend](https://github.com/your-org/expense-splitter-frontend)

## 📝 API Response Format

All API responses follow a consistent format for predictable client handling:

**Success Response:**
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Specific error 1", "Specific error 2"]
}
```

## 🤝 Contributing

- Follow existing code structure and naming conventions
- Write meaningful commit messages
- Test all endpoints before committing
- Run `npm run lint` and `npm run format` before submitting
- Ensure error handling is comprehensive
- Update documentation for new endpoints

## 📄 License

This project is part of the Expense Splitter application suite.

---

**Questions?** Check the troubleshooting section or open an issue in the repository.

**Happy splitting!** 💰✨
