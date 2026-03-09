# Price Optimization Tool

A full-stack web application for managing products and optimizing pricing strategies.

## 🏗️ **Architecture**

- **Backend**: FastAPI (Python)
- **Frontend**: React (Vite)
- **Database**: PostgreSQL
- **Authentication**: JWT

## 📁 **Project Structure**

```
price-optimization-tool/
├── backend/                    # FastAPI Backend
│   ├── src/
│   │   ├── core/              # Core configurations
│   │   ├── models/            # Request/Response & Database models
│   │   ├── routes/            # API endpoints
│   │   ├── controllers/       # Business logic (empty - for future)
│   │   ├── services/          # Service layer (empty - for future)
│   │   ├── utils/             # Utilities (empty - for future)
│   │   └── middleware/        # Middleware (empty - for future)
│   └── requirements.txt
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API calls
│   │   └── utils/             # Utility functions
│   └── package.json
└── database_setup.sql         # Database schema & sample data
```

## 🚀 **Setup Instructions**

### **Prerequisites**
- Python 3.8+
- Node.js 18+
- PostgreSQL 12+

### **1. Database Setup**

```bash
# Start PostgreSQL service
brew services start postgresql  # macOS
# OR
sudo service postgresql start   # Linux

# Create database and tables
psql -U postgres -f database_setup.sql
```

### **2. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Update database credentials in .env file
DATABASE_URL=postgresql://username:password@localhost/price_optimization
SECRET_KEY=your-super-secret-jwt-key

# Run the server
cd src
python main.py
```

Backend will be available at: `http://localhost:8000`

### **3. Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 🔐 **Authentication & Role Assignment**

### **User Roles**
- **Admin**: Full access to all features
- **Supplier**: Can manage products
- **Buyer**: Can view products

### **Role Assignment Process**
1. **During Signup**: Users select their role from dropdown
2. **Admin Override**: Admins can change user roles via database
3. **Default Role**: New users default to 'buyer' role

### **Default Login Credentials**
- **Email**: admin@example.com
- **Password**: admin123

## 📊 **Features Implemented**

### ✅ **Current Features**
- User authentication (Login/Signup)
- JWT-based authorization
- Product listing with all columns
- Role-based access control
- Responsive dashboard UI

### 🚧 **Future Features** (Folder structure ready)
- Product CRUD operations
- Demand forecasting
- Price optimization algorithms
- Analytics dashboard
- Chart visualizations

## 🛠️ **API Endpoints**

### **Authentication**
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user info

### **Products**
- `GET /api/v1/products` - Get all products

## 🎯 **Interview Focus Points**

### **Architecture Decisions**
1. **MVC Pattern**: Clear separation of concerns
2. **JWT Authentication**: Stateless, scalable authentication
3. **Role-based Authorization**: Flexible permission system
4. **RESTful API Design**: Standard HTTP methods and status codes

### **Database Design**
1. **Normalized Schema**: Proper relationships and constraints
2. **Indexing Strategy**: Performance optimization
3. **Data Types**: Appropriate column types for business logic

### **Security Considerations**
1. **Password Hashing**: bcrypt for secure password storage
2. **JWT Tokens**: Secure token-based authentication
3. **Input Validation**: Pydantic models for request validation
4. **CORS Configuration**: Proper cross-origin setup

### **Scalability Features**
1. **Modular Structure**: Easy to extend and maintain
2. **Service Layer**: Ready for complex business logic
3. **Environment Configuration**: Easy deployment across environments
4. **Database Migrations**: Alembic ready for schema changes

## 🧪 **Testing the Application**

1. **Start Backend**: `cd backend/src && python main.py`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:5173`
4. **Test Signup**: Create a new user account
5. **Test Login**: Login with created credentials
6. **View Dashboard**: See product data displayed in table format

## 📝 **Notes**

- Sample product data is automatically loaded
- JWT tokens expire in 24 hours
- All API endpoints require authentication except signup/login
- Frontend automatically handles token expiration and redirects to login