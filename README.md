# Real Estate Management Platform

A full-stack real estate management platform that supports public property discovery, authenticated user interactions, agent and agency management, and administrative operations.

The project is built with a **.NET backend using Clean Architecture** and a **Next.js frontend using the App Router**. It provides separate experiences for public users, authenticated users, agents, agencies, and administrators.

---

## 📌 Overview

This platform provides a centralized system for browsing and managing real estate listings.

Users can publicly browse available properties, search and filter listings, and explore properties through a map. Once authenticated, users can access additional functionality such as saving favorite properties, submitting reviews, sending inquiries, and managing their profile.

The platform also supports real estate agents and agencies, allowing agents to create and manage listings while agencies can be created and managed through an approval workflow.

Administrators have access to a dedicated dashboard for managing and monitoring the platform.

---

# ✨ Key Features

## 🌐 Public Features

Unauthenticated users can:

* Browse available property listings
* Search properties
* Filter properties based on available criteria
* View detailed property information
* Explore properties using the map interface
* View agent information
* View agency information
* Navigate through property listing results

Public browsing does not require an account.

---

## 🔐 Authentication & Account Management

The application provides authenticated functionality for registered users.

Implemented authentication-related functionality includes:

* User registration
* User login
* JWT-based authentication
* Protected API endpoints
* Role-based access control
* Email verification
* Password reset functionality
* Two-factor authentication (2FA)
* Authentication state management on the frontend
* Protected frontend routes and functionality

Sensitive development credentials are intentionally **not stored in this README**.

Development secrets are managed using **.NET User Secrets**.

---

## ❤️ Favorites

Authenticated users can:

* Add properties to their favorites
* Remove properties from their favorites
* View their saved properties

This allows users to maintain a personal shortlist of properties they are interested in.

---

## ⭐ Reviews

Authenticated users can interact with property reviews.

The review functionality supports:

* Submitting reviews
* Viewing reviews
* Managing user-created reviews
* Associating reviews with relevant properties

---

## 📩 Property Inquiries

Users can submit inquiries regarding properties.

The inquiry functionality allows users to:

* Contact relevant agents regarding a property
* Submit property-related inquiries
* Track inquiries through the authenticated experience

This provides a communication path between prospective customers and property agents.

---

# 👤 Agent Management

The platform provides functionality specifically for real estate agents.

Agents can:

* Manage their agent profile
* Create property listings
* Manage their listings
* Update listing information
* Handle property-related inquiries

Agent functionality is protected through authentication and authorization.

---

# 🏢 Agency Management

The platform also supports real estate agencies.

Implemented agency functionality includes:

* Agency creation
* Agency management
* Agent membership
* Join requests
* Agency approval workflows
* Agency member management

An agency can control who becomes a member through the join-approval process.

---

# 👑 Administration

A dedicated administration area provides platform-level management functionality.

The Admin Dashboard allows administrators to manage and monitor system-level information.

Administrative functionality is protected using role-based authorization so that restricted operations are only available to authorized administrators.

---

# 🗺️ Property Search & Map

Property discovery is one of the core features of the application.

The platform combines:

* Search
* Filtering
* Property listing results
* Property details
* Map-based property discovery

This allows users to find properties based on their requirements and geographic location.

---

# 🏗️ Architecture

The backend follows **Clean Architecture principles** to maintain separation of concerns and make the application easier to maintain, test, and extend.

The frontend follows the **Next.js App Router architecture**, organizing pages and application functionality around routes and reusable components.

### High-Level Architecture

```text
┌───────────────────────────────────────────┐
│                Frontend                   │
│              Next.js / React              │
│                                           │
│  App Router → Pages → Components → API    │
└──────────────────────┬────────────────────┘
                       │
                       │ HTTP / REST API
                       ▼
┌───────────────────────────────────────────┐
│                 Backend                   │
│                 ASP.NET                  │
│                                           │
│  API → Application → Domain → Infrastructure
└──────────────────────┬────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────┐
│                PostgreSQL                 │
│                  Database                 │
└───────────────────────────────────────────┘
```

---

# 🧱 Backend Architecture

The backend is organized using Clean Architecture layers.

```text
Backend
│
├── API
│   ├── Controllers
│   ├── Middleware
│   └── Configuration
│
├── Application
│   ├── Services
│   ├── DTOs
│   ├── Interfaces
│   └── Application Logic
│
├── Domain
│   ├── Entities
│   ├── Value Objects
│   └── Domain Logic
│
└── Infrastructure
    ├── Persistence
    ├── Entity Framework Core
    ├── Authentication
    ├── Email Services
    └── External Integrations
```

### API Layer

Responsible for:

* HTTP endpoints
* Request handling
* Authentication/authorization
* Input validation
* Returning API responses

### Application Layer

Contains the application's business use cases.

Responsibilities include:

* Application services
* DTOs
* Interfaces
* Business workflows
* Coordination between API and infrastructure

### Domain Layer

Contains the core business concepts of the system.

This layer is kept independent from external infrastructure concerns.

### Infrastructure Layer

Responsible for technical implementations such as:

* Database access
* Entity Framework Core
* PostgreSQL
* Authentication infrastructure
* Email functionality
* External services

---

# 🎨 Frontend Architecture

The frontend is implemented using Next.js and the App Router.

The structure follows the actual application organization rather than using a generic template.

```text
Frontend
│
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── dashboard/
│   ├── properties/
│   ├── agents/
│   ├── agencies/
│   └── ...
│
├── components/
│   ├── UI components
│   ├── Forms
│   ├── Property components
│   └── Shared components
│
├── lib/
│   ├── API utilities
│   ├── Authentication
│   └── Shared utilities
│
└── public/
    └── Static assets
```

The exact directory structure should remain aligned with the current repository structure.

---

# 🛠️ Technology Stack

## Backend

The backend technologies are based on the project's actual `.csproj` configuration.

| Technology                        | Purpose                        |
| --------------------------------- | ------------------------------ |
| .NET / ASP.NET Core               | Backend API                    |
| Entity Framework Core             | ORM / database access          |
| PostgreSQL                        | Relational database            |
| JWT                               | Authentication                 |
| ASP.NET Identity / Authentication | User and role management       |
| REST API                          | Frontend-backend communication |
| Docker                            | Local PostgreSQL environment   |
| .NET User Secrets                 | Local secret management        |

---

## Frontend

The frontend technologies are based on the project's actual `package.json`.

| Technology         | Purpose               |
| ------------------ | --------------------- |
| Next.js            | Frontend framework    |
| React              | UI development        |
| TypeScript         | Type-safe development |
| App Router         | Application routing   |
| CSS / UI libraries | Application styling   |
| npm                | Package management    |

---

# 📁 Project Structure

The repository contains both frontend and backend applications.

```text
Project Root
│
├── Backend/
│   ├── API/
│   ├── Application/
│   ├── Domain/
│   └── Infrastructure/
│
├── Frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
│
├── README.md
└── ...
```

> The repository's actual folder names should be retained here if they differ from the example structure above.

---

# 🚀 Getting Started

## Prerequisites

Before running the project locally, install:

* .NET SDK required by the backend
* Node.js
* npm
* Docker Desktop
* Git

Verify the installations:

```bash
dotnet --version
node --version
npm --version
docker --version
```

---

# 🗄️ Backend Setup

## 1. Start PostgreSQL

The project uses PostgreSQL for local development.

Start the PostgreSQL Docker container using the project's configured Docker setup.

For example:

```bash
docker compose up -d
```

Verify that the container is running:

```bash
docker ps
```

---

## 2. Configure Development Secrets

Sensitive values such as:

* JWT signing keys
* Database credentials
* Seeded administrator credentials
* Email-related credentials

should not be committed to source control.

Configure them using `.NET User Secrets`.

Example:

```bash
dotnet user-secrets set "Jwt:Key" "<your-development-jwt-key>"
```

Additional secrets should be configured according to the application's configuration requirements.

---

## 3. Restore Dependencies

From the backend project directory:

```bash
dotnet restore
```

---

## 4. Apply Database Migrations

Run:

```bash
dotnet ef database update
```

This creates/updates the local PostgreSQL database according to the project's Entity Framework Core migrations.

If Entity Framework CLI is not installed:

```bash
dotnet tool install --global dotnet-ef
```

---

## 5. Run the Backend

Start the API using:

```bash
dotnet run
```

The API will start using the configured development environment and URLs.

---

# 💻 Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

## Configure Environment Variables

Create:

```text
.env.local
```

Configure the required frontend environment variables, including the backend API URL.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:<PORT>
```

Use the port configured by the backend application.

---

## Run the Frontend

```bash
npm run dev
```

The Next.js development server will start locally.

Open the development URL shown in the terminal.

---

# ▶️ Running Both Applications

For local development, both applications need to be running.

### Terminal 1 — Backend

```bash
cd Backend
dotnet run
```

### Terminal 2 — Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend communicates with the backend through the configured API URL.

---

# 👑 Development SuperAdmin

The application supports a SuperAdmin account for development and administration testing.

The SuperAdmin is created through the application's seed/setup mechanism.

The actual password is **not documented in this README**.

This is intentional because the README is likely to be committed to the repository.

For local development, configure the required credentials using **.NET User Secrets**.

---

# ✉️ Local Email / Verification Testing

Email-based functionality can be tested during local development without requiring production email delivery.

Verification and password-reset links are surfaced through the configured local development email mechanism.

This allows developers to test:

* Email verification
* Password reset
* Account-related email flows

without exposing production credentials.

---

# 🔐 Testing Two-Factor Authentication

The application includes 2FA functionality.

The local development environment can be used to test the complete 2FA flow:

1. Enable 2FA for a user.
2. Configure the authenticator.
3. Generate a verification code.
4. Log in using the second authentication factor.
5. Verify that protected functionality remains accessible only after successful authentication.

---

# ⚙️ Configuration

The backend configuration is managed through `appsettings.json`, environment-specific configuration, and .NET User Secrets.

The following table describes the major configuration sections.

| Configuration                | Purpose                                 |
| ---------------------------- | --------------------------------------- |
| Database connection settings | PostgreSQL database connection          |
| JWT settings                 | Token generation and validation         |
| Authentication settings      | User authentication configuration       |
| Email settings               | Verification and password-reset emails  |
| 2FA settings                 | Two-factor authentication configuration |
| CORS settings                | Frontend API access                     |
| Logging settings             | Application logging                     |
| External service settings    | Configuration for external integrations |
| Seed configuration           | Development data initialization         |

### Important

Actual secrets must **not** be committed to `appsettings.json` or the README.

Use:

```bash
dotnet user-secrets
```

for local development secrets and environment variables or a secure secret store for deployed environments.

---

# 🔒 Security Considerations

The project intentionally avoids committing sensitive development credentials.

Do not commit:

```text
Passwords
JWT signing keys
API keys
Database passwords
SMTP credentials
Production secrets
```

Use one of the following mechanisms instead:

* .NET User Secrets
* Environment variables
* CI/CD secret variables
* Cloud secret management services

---

# 🧪 Testing Status

Automated tests have not yet been implemented for the current version of the project.

Current validation is primarily performed through:

* Local development
* API testing
* Frontend interaction
* Authentication flow testing
* Role/permission testing
* Database validation
* Manual feature verification

Automated unit and integration tests are planned as a future improvement.

---

# ⚠️ Known Limitations

The current development version has the following limitations:

### 1. Automated Tests

Automated unit/integration tests are not currently implemented.

### 2. Local Database

Development currently uses **PostgreSQL locally through Docker**.

The local environment is not connected to a production Neon PostgreSQL deployment.

### 3. Deployment

The application has not yet been deployed to a production environment.

### 4. Production Configuration

Production-specific infrastructure and secret management still need to be configured before deployment.

---

# 📌 Current Implementation Summary

The current implementation covers the major application foundation and user workflows.

### Implemented

* Public property browsing
* Property search
* Property filtering
* Map-based property discovery
* User authentication
* JWT authentication
* Role-based authorization
* Email verification
* Password reset
* Two-factor authentication
* Favorite properties
* Property reviews
* Property inquiries
* Agent management
* Agent listings
* Agency creation
* Agency membership
* Agency join approval workflow
* Administrative dashboard
* PostgreSQL persistence
* Entity Framework Core migrations
* Docker-based local database setup
* Frontend/backend integration
* Development secret management

---

# 🔄 Development Workflow

A typical development workflow is:

```text
1. Start PostgreSQL
        ↓
2. Configure User Secrets
        ↓
3. Apply EF Core migrations
        ↓
4. Start Backend API
        ↓
5. Configure .env.local
        ↓
6. Install Frontend dependencies
        ↓
7. Start Next.js
        ↓
8. Test application features
```

---

# 📋 Future Improvements

Potential improvements for future development include:

* Automated unit tests
* Integration tests
* End-to-end testing
* Production deployment
* Production database configuration
* Improved monitoring and logging
* CI/CD pipeline
* Production secret management
* Performance optimization
* Additional administrative capabilities

---

# 👨‍💻 Development Notes

This README intentionally documents **how the application works and how developers should configure it**, rather than exposing sensitive credentials.

In particular, seeded administrator passwords and JWT signing keys are not included.

This makes the README safe to commit to version control while still providing enough information for another developer to set up the application locally.

---

# 📄 Project Status

**Status:** Active Development

The core platform functionality has been implemented and the project can be run locally using the documented backend and frontend setup.

The next major areas of improvement are automated testing, production infrastructure, deployment, and further refinement based on user feedback.

---

## Quick Reference

| Component        | Command                                 |
| ---------------- | --------------------------------------- |
| Start PostgreSQL | `docker compose up -d`                  |
| Restore backend  | `dotnet restore`                        |
| Apply migrations | `dotnet ef database update`             |
| Run backend      | `dotnet run`                            |
| Install frontend | `npm install`                           |
| Run frontend     | `npm run dev`                           |
| Configure secret | `dotnet user-secrets set "Key" "Value"` |

---

## 🔗 Architecture at a Glance

```text
                 ┌───────────────────┐
                 │     End Users     │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │   Next.js Web UI  │
                 │     React/TS      │
                 └─────────┬─────────┘
                           │
                       REST API
                           │
                           ▼
                 ┌───────────────────┐
                 │   ASP.NET Core    │
                 │      API          │
                 └─────────┬─────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
     ┌────────────────┐       ┌─────────────────┐
     │ Clean          │       │ Authentication  │
     │ Architecture   │       │ & Authorization │
     └────────┬───────┘       └─────────────────┘
              │
              ▼
     ┌────────────────┐
     │ Entity         │
     │ Framework Core │
     └────────┬───────┘
              │
              ▼
     ┌────────────────┐
     │  PostgreSQL    │
     │ Docker (Local) │
     └────────────────┘
```

---

## Conclusion

This project provides a complete foundation for a real estate management platform, combining property discovery, user engagement, agent and agency management, and administrative capabilities in a single full-stack application.

The implementation follows a structured architecture, separates frontend and backend responsibilities, protects sensitive configuration, and provides a reproducible local development setup.

The current focus is on strengthening the platform through automated testing, production-ready infrastructure, deployment, and continued feature refinement.
