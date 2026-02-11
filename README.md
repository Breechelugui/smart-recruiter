# Smart Recruiter

A comprehensive technical interview assessment platform that streamlines recruitment by enabling recruiters to create, manage, and evaluate technical assessments while providing candidates with a seamless interview experience.

## Features

- **Assessment Management**: Create technical assessments with multiple question types (multiple choice, subjective, coding challenges)
- **Candidate Management**: Invite candidates, track progress, and manage the assessment pipeline
- **Real-time Analytics**: Dashboard with candidate performance insights
- **Interactive Coding Environment**: Monaco Editor with syntax highlighting and IntelliSense
- **Automated Notifications**: Email notifications for invitations and status updates
- **CodeWars Integration**: Import coding challenges from CodeWars platform

## Tech Stack

**Backend**: FastAPI, PostgreSQL, SQLAlchemy, JWT authentication  
**Frontend**: React 19, Vite, Redux Toolkit, Tailwind CSS, Monaco Editor

## Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+

## Quick Start

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd smart-recruiter
   ```

2. **Backend setup**
   ```bash
   cd backend
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env  # Configure your database and API keys
   python migrate.py && python seed_katas.py
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env  # Configure API endpoints
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://username:password@localhost/dbname
SECRET_KEY=your-secret-key
SENDGRID_API_KEY=your-sendgrid-key
CODEWARS_API_KEY=your-codewars-key
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Smart Recruiter
```

## Testing

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test && npm run test:coverage
```

## Deployment

**Docker**
```bash
docker-compose up --build
```

**Production**
```bash
# Backend
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend && npm run build && npm run preview
```

## API Endpoints

- **Auth**: `/auth/register`, `/auth/login`, `/auth/refresh`
- **Assessments**: CRUD operations at `/assessments/`
- **Users**: Profile management at `/users/`
- **Submissions**: Assessment responses at `/submissions/`
- **Analytics**: Dashboard stats at `/analytics/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Team

- Brenda Jebet - Scrum Master
- Brandon Dikirr - Developer
- Brian Muigai - Developer
- Ramadhan Galgalo - Developer
- Eugine Omondi - Developer