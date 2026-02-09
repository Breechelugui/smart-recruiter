# Smart Recruiter

A comprehensive technical interview assessment platform that streamlines the recruitment process by enabling recruiters to create, manage, and evaluate technical assessments while providing candidates with a seamless interview experience.

## 🚀 Features

### For Recruiters
- **Assessment Management**: Create and customize technical assessments with multiple question types (multiple choice, subjective, coding challenges)
- **Candidate Management**: Invite candidates, track progress, and manage the entire assessment pipeline
- **Real-time Analytics**: Comprehensive dashboard with insights on candidate performance and assessment statistics
- **Automated Notifications**: Email notifications for assessment invitations, reminders, and status updates
- **CodeWars Integration**: Import coding challenges from CodeWars platform

### For Candidates
- **Interactive Coding Environment**: Monaco Editor-powered coding interface with syntax highlighting and IntelliSense
- **Multi-format Questions**: Support for various question types including coding challenges and theoretical questions
- **Progress Tracking**: Real-time submission status and assessment progress
- **User-friendly Interface**: Modern, responsive design built with React and Tailwind CSS

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.8+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation
- **Background Tasks**: Scheduled notifications and email delivery
- **File Upload**: Support for assessment materials and candidate submissions

### Frontend (React)
- **Framework**: React 19 with Vite for fast development
- **State Management**: Redux Toolkit for predictable state management
- **Routing**: React Router for client-side navigation
- **UI Components**: Headless UI + Tailwind CSS for modern, accessible components
- **Code Editor**: Monaco Editor for in-app coding challenges
- **Charts**: Recharts for data visualization and analytics

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## 🛠️ Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-recruiter
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   # or with pipenv
   pipenv install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   ```

5. **Run database migrations**
   ```bash
   python migrate.py
   ```

6. **Seed the database**
   ```bash
   python seed_katas.py
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API endpoints
   ```

## 🚀 Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Production Deployment

#### Backend
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 📊 Database Schema

### Core Models
- **Users**: Recruiters and interviewees with role-based access
- **Assessments**: Technical assessments with multiple question types
- **Questions**: Individual questions within assessments
- **Invitations**: Assessment invitations sent to candidates
- **Submissions**: Candidate responses and assessment results
- **Notifications**: System notifications and email alerts

## 🔐 Authentication & Security

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Pydantic models for request validation
- **Role-based Access**: Different permissions for recruiters and interviewees

## 📧 Email Integration

- **SendGrid**: Email delivery service for notifications
- **Template System**: Customizable email templates
- **Automated Reminders**: Scheduled notifications for pending assessments

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

## 📈 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh

### Assessments
- `GET /assessments/` - List assessments
- `POST /assessments/` - Create assessment
- `GET /assessments/{id}` - Get assessment details
- `PUT /assessments/{id}` - Update assessment
- `DELETE /assessments/{id}` - Delete assessment

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

### Submissions
- `GET /submissions/` - List submissions
- `POST /submissions/` - Create submission
- `GET /submissions/{id}` - Get submission details

### Analytics
- `GET /analytics/dashboard` - Dashboard statistics
- `GET /analytics/performance` - Performance metrics

## 🎨 UI Components

- **Dashboard**: Overview of assessments and candidates
- **Assessment Builder**: Drag-and-drop interface for creating assessments
- **Code Editor**: Full-featured coding environment
- **Analytics Dashboard**: Interactive charts and metrics
- **Candidate Management**: Track candidate progress and results

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost/dbname
SECRET_KEY=your-secret-key
SENDGRID_API_KEY=your-sendgrid-key
CODEWARS_API_KEY=your-codewars-key
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Smart Recruiter
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Vercel (Frontend)
```bash
cd frontend
npm run build
vercel --prod
```

### Railway/Heroku (Backend)
Deploy the backend using the provided `Dockerfile` or by connecting your Git repository.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Brenda Jebet** - Scrum Master
- **Brandon Dikirr** - Developer
- **Brian Muigai** - Developer  
- **Ramadhan Galgalo** - Developer
- **Eugine Omondi** - Developer

## 📞 Support

For support and questions, please reach out to the development team or create an issue in the repository.

---

**Built with ❤️ for streamlining technical recruitment**