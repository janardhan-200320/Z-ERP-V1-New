import express from 'express';
import * as hrmController from '../controllers/hrm.controller';

const router = express.Router();

// ==================== AUTH ROUTES ====================
router.post('/auth/login', hrmController.loginWithEmployeeEmail);

// ==================== EMPLOYEE ROUTES ====================
router.get('/employees', hrmController.getEmployees);
router.get('/employees/:id', hrmController.getEmployeeById);
router.post('/employees', hrmController.createEmployee);
router.put('/employees/:id', hrmController.updateEmployee);
router.delete('/employees/:id', hrmController.deleteEmployee);

// ==================== DEPARTMENT ROUTES ====================
router.get('/departments', hrmController.getDepartments);
router.post('/departments', hrmController.createDepartment);
router.put('/departments/:id', hrmController.updateDepartment);
router.delete('/departments/:id', hrmController.deleteDepartment);

// ==================== DESIGNATION ROUTES ====================
router.get('/designations', hrmController.getDesignations);
router.post('/designations', hrmController.createDesignation);
router.put('/designations/:id', hrmController.updateDesignation);
router.delete('/designations/:id', hrmController.deleteDesignation);

// ==================== ATTENDANCE ROUTES ====================
router.get('/attendance', hrmController.getAttendance);
router.post('/attendance', hrmController.createAttendance);
router.put('/attendance/:id', hrmController.updateAttendance);

// ==================== ATTENDANCE RECORDS (SELF-SERVICE) ====================
router.get('/attendance-records', hrmController.getAttendanceRecords);
router.post('/attendance-records/check-in', hrmController.checkInAttendanceRecord);
router.post('/attendance-records/check-out', hrmController.checkOutAttendanceRecord);

// ==================== LEAVE TYPE ROUTES ====================
router.get('/leave-types', hrmController.getLeaveTypes);
router.post('/leave-types', hrmController.createLeaveType);

// ==================== LEAVE APPLICATION ROUTES ====================
router.get('/leave-applications', hrmController.getLeaveApplications);
router.post('/leave-applications', hrmController.createLeaveApplication);
router.put('/leave-applications/:id', hrmController.updateLeaveApplication);

// ==================== LEAVE REQUESTS (SELF-SERVICE) ====================
router.get('/leave-requests', hrmController.getLeaveRequests);
router.post('/leave-requests', hrmController.createLeaveRequest);
router.put('/leave-requests/:id', hrmController.updateLeaveRequest);

// ==================== SALARY ROUTES ====================
router.get('/salaries', hrmController.getSalaries);
router.post('/salaries', hrmController.createSalary);
router.put('/salaries/:id', hrmController.updateSalary);

// ==================== PAYROLL RECORD ROUTES ====================
router.get('/payroll-records', hrmController.getPayrollRecords);
router.post('/payroll-records', hrmController.createPayrollRecord);
router.put('/payroll-records/:id', hrmController.updatePayrollRecord);
router.delete('/payroll-records/:id', hrmController.deletePayrollRecord);

// ==================== ASSET ROUTES ====================
router.get('/assets', hrmController.getAssets);
router.post('/assets', hrmController.createAsset);
router.put('/assets/:id', hrmController.updateAsset);
router.delete('/assets/:id', hrmController.deleteAsset);

// ==================== TRAVEL REQUEST ROUTES ====================
router.get('/travel-requests', hrmController.getTravelRequests);
router.post('/travel-requests', hrmController.createTravelRequest);
router.put('/travel-requests/:id', hrmController.updateTravelRequest);
router.delete('/travel-requests/:id', hrmController.deleteTravelRequest);

// ==================== EXPENSE CLAIM ROUTES ====================
router.get('/expense-claims', hrmController.getExpenseClaims);
router.post('/expense-claims', hrmController.createExpenseClaim);
router.put('/expense-claims/:id', hrmController.updateExpenseClaim);
router.delete('/expense-claims/:id', hrmController.deleteExpenseClaim);

// ==================== INSURANCE POLICY ROUTES ====================
router.get('/insurance-policies', hrmController.getInsurancePolicies);
router.post('/insurance-policies', hrmController.createInsurancePolicy);
router.put('/insurance-policies/:id', hrmController.updateInsurancePolicy);
router.delete('/insurance-policies/:id', hrmController.deleteInsurancePolicy);

// ==================== INSURANCE CLAIM ROUTES ====================
router.get('/insurance-claims', hrmController.getInsuranceClaims);
router.post('/insurance-claims', hrmController.createInsuranceClaim);
router.put('/insurance-claims/:id', hrmController.updateInsuranceClaim);
router.delete('/insurance-claims/:id', hrmController.deleteInsuranceClaim);

// ==================== PUBLIC HOLIDAY ROUTES ====================
router.get('/public-holidays', hrmController.getPublicHolidays);
router.post('/public-holidays', hrmController.createPublicHoliday);
router.put('/public-holidays/:id', hrmController.updatePublicHoliday);
router.delete('/public-holidays/:id', hrmController.deletePublicHoliday);

// ==================== ANNOUNCEMENT ROUTES ====================
router.get('/announcements', hrmController.getAnnouncements);
router.post('/announcements', hrmController.createAnnouncement);
router.put('/announcements/:id', hrmController.updateAnnouncement);
router.delete('/announcements/:id', hrmController.deleteAnnouncement);

// ==================== HR LETTER ROUTES ====================
router.get('/hr-letters', hrmController.getHrLetters);
router.post('/hr-letters', hrmController.createHrLetter);
router.put('/hr-letters/:id', hrmController.updateHrLetter);
router.delete('/hr-letters/:id', hrmController.deleteHrLetter);

export default router;
