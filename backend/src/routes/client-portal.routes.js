const express = require('express');
const {
  getClientProjects,
  getProjectOverview,
  getProjectTasks,
  getTaskDetails,
  getProjectMilestones,
  getMilestoneDetails,
  getProjectTimesheets,
  getProjectFiles,
  getProjectCommunications,
  addProjectCommunication,
  getProjectTeamMembers,
  getProjectProgressReport,
  getProjectFinancialReport,
  getClientDashboard,
} = require('../controllers/client-portal.controller');

const router = express.Router();

// Client Dashboard Routes
router.get('/customer/:customerId/dashboard', getClientDashboard);
router.get('/customer/:customerId/projects', getClientProjects);

// Project Overview Routes
router.get('/project/:projectId/overview', getProjectOverview);

// Tasks Routes
router.get('/project/:projectId/tasks', getProjectTasks);
router.get('/project/:projectId/task/:taskId', getTaskDetails);

// Milestones Routes
router.get('/project/:projectId/milestones', getProjectMilestones);
router.get('/project/:projectId/milestone/:milestoneId', getMilestoneDetails);

// Timesheets Routes
router.get('/project/:projectId/timesheets', getProjectTimesheets);

// Files & Documents Routes
router.get('/project/:projectId/files', getProjectFiles);

// Communications Routes
router.get('/project/:projectId/communications', getProjectCommunications);
router.post('/project/:projectId/communication', addProjectCommunication);

// Team Members Routes
router.get('/project/:projectId/team-members', getProjectTeamMembers);

// Reports Routes
router.get('/project/:projectId/reports/progress', getProjectProgressReport);
router.get('/project/:projectId/reports/financial', getProjectFinancialReport);

module.exports = router;
