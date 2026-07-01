# CodeMentor AI - Complete Folder Structure

```
codementor-mern/
├── client/                          # React Frontend (Vite)
│   ├── public/
│   │   ├── favicon.ico
│   │   └── logo.svg
│   ├── src/
│   │   ├── assets/                   # Static assets
│   │   │   ├── images/
│   │   │   └── icons/
│   │   ├── components/              # React components
│   │   │   ├── common/              # Shared components (Button, Input, Modal, etc.)
│   │   │   ├── auth/                # Authentication components
│   │   │   ├── dashboard/           # Dashboard components
│   │   │   ├── repository/          # Repository management
│   │   │   ├── ai/                  # AI chat and features
│   │   │   ├── learning/            # Learning modules
│   │   │   ├── documentation/       # Documentation viewer
│   │   │   ├── architecture/        # Architecture visualization
│   │   │   ├── knowledge/           # Knowledge graph
│   │   │   ├── settings/            # User settings
│   │   │   └── notifications/       # Notification components
│   │   ├── contexts/                # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   └── NotificationContext.tsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useRepository.ts
│   │   │   ├── useAI.ts
│   │   │   └── useLearning.ts
│   │   ├── pages/                   # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── RepositoryPage.tsx
│   │   │   ├── AIChatPage.tsx
│   │   │   ├── LearningPage.tsx
│   │   │   ├── DocumentationPage.tsx
│   │   │   ├── ArchitecturePage.tsx
│   │   │   ├── KnowledgePage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── services/                # API services
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── repositoryService.ts
│   │   │   ├── aiService.ts
│   │   │   └── learningService.ts
│   │   ├── styles/                  # Global styles
│   │   │   ├── globals.css
│   │   │   └── themes.css
│   │   ├── types/                   # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   ├── repository.ts
│   │   │   └── ai.ts
│   │   ├── utils/                   # Utility functions
│   │   │   ├── helpers.ts
│   │   │   ├── validators.ts
│   │   │   └── formatters.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.local
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/                  # Configuration
│   │   │   ├── database.ts
│   │   │   ├── cloudinary.ts
│   │   │   ├── openai.ts
│   │   │   └── claude.ts
│   │   ├── controllers/             # Route controllers
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── repositoryController.ts
│   │   │   ├── aiController.ts
│   │   │   ├── learningController.ts
│   │   │   ├── documentationController.ts
│   │   │   └── notificationController.ts
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── error.ts
│   │   │   ├── validation.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── cors.ts
│   │   ├── models/                  # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── Repository.ts
│   │   │   ├── Chat.ts
│   │   │   ├── Message.ts
│   │   │   ├── LearningProgress.ts
│   │   │   ├── Achievement.ts
│   │   │   ├── Project.ts
│   │   │   ├── Embedding.ts
│   │   │   ├── Notification.ts
│   │   │   ├── Session.ts
│   │   │   └── Settings.ts
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── repositories.ts
│   │   │   ├── ai.ts
│   │   │   ├── learning.ts
│   │   │   ├── documentation.ts
│   │   │   └── notifications.ts
│   │   ├── services/                # Business logic
│   │   │   ├── authService.ts
│   │   │   ├── repositoryService.ts
│   │   │   ├── aiService.ts
│   │   │   ├── learningService.ts
│   │   │   ├── documentationService.ts
│   │   │   ├── embeddingService.ts
│   │   │   └── notificationService.ts
│   │   ├── types/                   # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   └── api.ts
│   │   ├── utils/                   # Utility functions
│   │   │   ├── helpers.ts
│   │   │   ├── validators.ts
│   │   │   └── logger.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── shared/                          # Shared code
│   ├── types/                       # Shared TypeScript types
│   │   └── index.ts
│   ├── utils/                       # Shared utilities
│   │   └── helpers.ts
│   └── constants/                   # Shared constants
│       └── index.ts
│
├── docs/                            # Documentation
│   ├── api/                         # API documentation
│   │   ├── endpoints.md
│   │   └── schemas.md
│   ├── architecture/                # Architecture docs
│   │   ├── system-design.md
│   │   └── database-schema.md
│   └── deployment/                  # Deployment guides
│       ├── docker.md
│       └── vercel-render.md
│
├── docker/                          # Docker files
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── docker-compose.yml
│
├── .github/
│   └── workflows/                   # GitHub Actions
│       ├── ci.yml
│       └── deploy.yml
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

## Summary

This is the complete production-ready folder structure for CodeMentor AI, a MERN stack application with:

- **Frontend**: React 19 + Vite + TypeScript + TailwindCSS + Shadcn UI
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **AI Integration**: Claude API + OpenAI API + LangChain
- **Authentication**: JWT + Google OAuth + GitHub OAuth
- **Features**: Repository management, AI chat, learning paths, documentation generation, architecture visualization, knowledge graphs
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD
