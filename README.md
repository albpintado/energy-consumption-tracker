# Energy Consumption Tracker

A comprehensive energy consumption tracking application built with NestJS and TypeORM that allows users to monitor their energy usage, calculate costs based on different rate periods, and manage contracts with various suppliers.

## 🚀 API Documentation (Swagger)

**Access the interactive API documentation at: [`http://localhost:3000/api/docs`](http://localhost:3000/api/docs)**

The Swagger UI provides:

- Complete API endpoint documentation
- Interactive request/response testing
- Schema definitions for all DTOs
- Authentication examples with Bearer tokens
- Real-time API exploration

_Start the application and navigate to `/api/docs` to explore all available endpoints._

## ✨ Features

- **Energy Consumption Tracking**: Record and monitor hourly energy usage with 3-decimal precision
- **Dynamic Pricing**: Support for peak, standard, and off-peak rate periods
- **Cost Calculation**: Automatic cost computation based on time-of-use rates
- **User Management**: JWT-based authentication with secure password hashing
- **Contract Management**: Multiple contracts per user with different suppliers and rates
- **Discount System**: Percentage-based cost reductions with time constraints
- **RESTful API**: Comprehensive REST endpoints with full Swagger documentation

## 🏗️ Architecture

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with bcrypt password hashing
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest (unit) + Supertest (e2e)
- **Code Quality**: ESLint + Prettier

## 📊 Core Entities

- **User**: Authentication and contract ownership
- **Contract**: Links users to rate plans with supplier information
- **Consumption**: Records hourly energy usage by date and hour
- **Rate**: Defines energy and power pricing per kWh for each period
- **Discount**: Applies percentage-based cost reductions with constraints

## ⚡ Energy Periods

The application uses three energy pricing periods:

- **Peak**: 10-14h and 16-22h (highest rates)
- **Standard**: 8-10h, 14-16h, and 22-0h (medium rates)
- **Off-Peak**: 0-8h (lowest rates)

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd energy-consumption-tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the database**

```bash
docker-compose up -d
```

4. **Run the application**

```bash
# Development with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

5. **Access the application**

- API: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/api/docs`

### Database Configuration

The application connects to PostgreSQL with these default settings:

- Host: `localhost:5432`
- Username: `postgres`
- Password: `postgres`
- Database: `energy-comsumption-tracker-dev`

## 🧪 Testing

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# End-to-end tests
npm run test:e2e

# Test coverage report
npm run test:cov

# Debug tests
npm run test:debug
```

## 🔧 Development Commands

### Code Quality

```bash
# Lint and fix code
npm run lint

# Format code with Prettier
npm run format

# Build application
npm run build
```

### Database Management

```bash
# Start PostgreSQL container
docker-compose up -d

# Stop PostgreSQL container
docker-compose down
```

## 📚 Project Structure

```
src/
├── auth/           # JWT authentication module
├── config/         # Database and application configuration
├── consumption/    # Energy consumption tracking
├── contracts/      # Contract management
├── discounts/      # Discount system
├── helpers/        # Utility functions (energy periods)
├── rates/          # Energy rate management
├── test-utils/     # Testing utilities and mocks
└── users/          # User management
```

## 🔗 API Endpoints

Once the application is running, explore the complete API documentation at:
**[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

Key endpoint categories:

- **Authentication**: Login, register, profile management
- **Contracts**: Create and manage energy contracts
- **Consumption**: Record and retrieve energy usage data
- **Rates**: Manage pricing tiers and periods
- **Discounts**: Apply cost reductions
- **Dashboard**: Overview and analytics endpoints

## 🔐 Authentication

The API uses JWT Bearer token authentication. To access protected endpoints:

1. Register or login via `/auth/register` or `/auth/login`
2. Use the returned JWT token in the Authorization header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```
3. Test authentication in Swagger UI using the "Authorize" button

## 🛠️ Built With

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TypeORM](https://typeorm.io/) - TypeScript ORM
- [PostgreSQL](https://postgresql.org/) - Database
- [Swagger](https://swagger.io/) - API documentation
- [Jest](https://jestjs.io/) - Testing framework
- [Docker](https://docker.com/) - Containerization

## 📄 License

This project is [MIT licensed](LICENSE).
