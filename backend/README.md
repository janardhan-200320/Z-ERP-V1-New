# ERP Backend - HRM Module

This is the backend for the ERP system with a complete HRM module built with Node.js, Express, and Supabase.

## Features

- ✅ Employee Management (CRUD)
- ✅ Attendance Tracking
- ✅ Leave Management
- ✅ Salary Processing
- ✅ Department & Designation Management
- ✅ Performance Reviews
- ✅ Training Records
- ✅ Employment Contracts
- ✅ Employee Benefits
- ✅ Shift Management

## Prerequisites

- Node.js v16 or higher
- Supabase Account
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required environment variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)
- `FRONTEND_URL` - Frontend URL for CORS (e.g., http://localhost:5173)

### 3. Create Database Tables in Supabase

Go to your Supabase SQL Editor and run the SQL script from `sql/hrm-tables.sql` or use the SQL code provided earlier to create all HRM tables.

### 4. Run the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Employees
- `GET /api/hrm/employees` - Get all employees
- `GET /api/hrm/employees/:id` - Get employee by ID
- `POST /api/hrm/employees` - Create new employee
- `PUT /api/hrm/employees/:id` - Update employee
- `DELETE /api/hrm/employees/:id` - Delete employee

### Departments
- `GET /api/hrm/departments` - Get all departments
- `POST /api/hrm/departments` - Create department
- `PUT /api/hrm/departments/:id` - Update department
- `DELETE /api/hrm/departments/:id` - Delete department

### Designations
- `GET /api/hrm/designations` - Get all designations
- `POST /api/hrm/designations` - Create designation
- `PUT /api/hrm/designations/:id` - Update designation
- `DELETE /api/hrm/designations/:id` - Delete designation

### Attendance
- `GET /api/hrm/attendance` - Get attendance records
- `POST /api/hrm/attendance` - Mark attendance
- `PUT /api/hrm/attendance/:id` - Update attendance

### Leave Management
- `GET /api/hrm/leave-types` - Get leave types
- `POST /api/hrm/leave-types` - Create leave type
- `GET /api/hrm/leave-applications` - Get leave applications
- `POST /api/hrm/leave-applications` - Create leave application
- `PUT /api/hrm/leave-applications/:id` - Update leave application

### Salaries
- `GET /api/hrm/salaries` - Get salary records
- `POST /api/hrm/salaries` - Create salary record
- `PUT /api/hrm/salaries/:id` - Update salary record

### Payroll Records
- `GET /api/hrm/payroll-records` - Get payroll records
- `POST /api/hrm/payroll-records` - Create payroll record
- `PUT /api/hrm/payroll-records/:id` - Update payroll record
- `DELETE /api/hrm/payroll-records/:id` - Delete payroll record

### Assets
- `GET /api/hrm/assets` - Get asset records
- `POST /api/hrm/assets` - Create asset record
- `PUT /api/hrm/assets/:id` - Update asset record
- `DELETE /api/hrm/assets/:id` - Delete asset record

### Travel Requests
- `GET /api/hrm/travel-requests` - Get travel requests
- `POST /api/hrm/travel-requests` - Create travel request
- `PUT /api/hrm/travel-requests/:id` - Update travel request
- `DELETE /api/hrm/travel-requests/:id` - Delete travel request

### Expense Claims
- `GET /api/hrm/expense-claims` - Get expense claims
- `POST /api/hrm/expense-claims` - Create expense claim
- `PUT /api/hrm/expense-claims/:id` - Update expense claim
- `DELETE /api/hrm/expense-claims/:id` - Delete expense claim

### Public Holidays
- `GET /api/hrm/public-holidays` - Get public holidays
- `POST /api/hrm/public-holidays` - Create public holiday
- `PUT /api/hrm/public-holidays/:id` - Update public holiday
- `DELETE /api/hrm/public-holidays/:id` - Delete public holiday

### Announcements
- `GET /api/hrm/announcements` - Get announcements
- `POST /api/hrm/announcements` - Create announcement
- `PUT /api/hrm/announcements/:id` - Update announcement
- `DELETE /api/hrm/announcements/:id` - Delete announcement

### HR Letters
- `GET /api/hrm/hr-letters` - Get HR letters
- `POST /api/hrm/hr-letters` - Create HR letter
- `PUT /api/hrm/hr-letters/:id` - Update HR letter
- `DELETE /api/hrm/hr-letters/:id` - Delete HR letter

## Example Requests

### Create Employee
```bash
curl -X POST http://localhost:5000/api/hrm/employees \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com",
    "phone": "1234567890",
    "date_of_joining": "2024-01-15",
    "status": "active"
  }'
```

### Mark Attendance
```bash
curl -X POST http://localhost:5000/api/hrm/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "uuid-here",
    "date": "2024-01-15",
    "check_in_time": "09:00:00",
    "check_out_time": "17:30:00",
    "status": "present"
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts          # Supabase client configuration
│   ├── controllers/
│   │   └── hrm.controller.ts    # HRM business logic
│   ├── routes/
│   │   └── hrm.routes.ts        # HRM API routes
│   ├── types/
│   │   └── hrm.types.ts         # TypeScript interfaces
│   └── index.ts                 # Main server file
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── README.md                   # This file
```

## Technologies Used

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (via Supabase)
- **Security:** Helmet, CORS
- **Logging:** Morgan

## Security Considerations

1. Always use HTTPS in production
2. Keep your Supabase keys secure
3. Use environment variables for all secrets
4. Implement proper authentication middleware
5. Add role-based access control (RBAC)
6. Validate all input data
7. Use rate limiting in production

## Error Handling

All endpoints return proper HTTP status codes and error messages:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

## Troubleshooting

### Connection Error to Supabase
- Check if `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Verify your Supabase project is running
- Check your internet connection

### CORS Errors
- Verify `FRONTEND_URL` matches your frontend origin
- Check if frontend is running on the specified port

### TypeScript Errors
- Run `npm run build` to check for compilation errors
- Ensure TypeScript is installed: `npm install typescript`

## Next Steps

1. Add authentication middleware
2. Implement pagination for list endpoints
3. Add filtering and sorting capabilities
4. Create validation schemas
5. Set up automated testing
6. Add API documentation with Swagger/OpenAPI
7. Implement caching strategies
8. Add performance monitoring

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
