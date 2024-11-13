import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './protectedRoutes';

// Admin Components
import Layout from './layouts';
import Dashboard from './dashboard';
import DashboardCardEmployees from './DashboardCardEmployees';
import LeaveTracking from './leavetracking';
import UserManagement from './usermanagement';
import Employees from './employees';
import EmployeeView from './EmployeeView';
import EmployeeUpdate from './EmployeeUpdate';
import RequestTracking from './requesttracking';
import Tasks from './Tasks';
import TaskUpdate from './TaskUpdate';
import TaskView from './TaskView';
import Attendance from './attendence';
import Logout from './logout';
import ChangePassword from './ChangePassword';
import SiteMainPage from './SitesMainPage';
import SiteView from './SiteView';

// Manager Components
import ManagerLayout from './manager/Components/ManagerLayout';
import ManagerDashboard from './manager/Components/ManagerDashboard';
import ManagerDashboardCardEmployees from './manager/Components/ManagerDashboardCardEmployees';
import ManagerAttendancePage from './manager/Components/ManagerAttendance';
import ManagerLeaveTracking from './manager/Components/ManagerLeaveTracking';
import ManagerEmployeePage from './manager/Components/ManagerEmployees';
import ManagerEmployeeView from './manager/Components/ManagerEmployeeView';
import ManagerEmployeeUpdate from './manager/Components/ManagerEmployeeUpdate';
import ManagerUserManagement from './manager/Components/ManagerUserManagement';
import ManagerRequestTracking from './manager/Components/ManagerRequestTracking';
import ManagerTasks from './manager/Components/ManagerTasks';
import ManagerTaskView from './manager/Components/ManagerTaskView';
import ManagerTaskUpdateForm from './manager/Components/ManagerTaskUpdate';
import ManagerSiteMainPage from './manager/Components/ManagerSitesMainPage';
import ManagerSiteView from './manager/Components/ManagerSiteView';

const App = () => {
    return (
        <Router basename={'/taweb'}>
            <AuthProvider>
                <Routes>
                    {/* Common Routes */}
                    <Route path="/login" element={<Logout />} />
                    <Route path="/change-password" element={<ProtectedRoute element={ChangePassword} allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER']} />} />
                    
                    {/* Admin Routes */}
                    <Route path="/" element={<ProtectedRoute element={Layout} allowedRoles={['ROLE_ADMIN']} />}>
                        <Route path="dashboard" element={<ProtectedRoute element={Dashboard} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="employees/:statName" element={<ProtectedRoute element={DashboardCardEmployees} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="employeeview" element={<ProtectedRoute element={EmployeeView} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="leave-tracking" element={<ProtectedRoute element={LeaveTracking} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="user-management" element={<ProtectedRoute element={UserManagement} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="site-view" element={<ProtectedRoute element={SiteView} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="employees" element={<ProtectedRoute element={Employees} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="employee-update" element={<ProtectedRoute element={EmployeeUpdate} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="sites" element={<ProtectedRoute element={SiteMainPage} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="request-tracking" element={<ProtectedRoute element={RequestTracking} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="task-management" element={<ProtectedRoute element={Tasks} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="task-update" element={<ProtectedRoute element={TaskUpdate} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="task-view" element={<ProtectedRoute element={TaskView} allowedRoles={['ROLE_ADMIN']} />} />
                        <Route path="attendance" element={<ProtectedRoute element={Attendance} allowedRoles={['ROLE_ADMIN']} />} />
                    </Route>

                    {/* Manager Routes */}
                    <Route path="/manager" element={<ProtectedRoute element={ManagerLayout} allowedRoles={['ROLE_MANAGER']} />}>
                        <Route path="dashboard" element={<ProtectedRoute element={ManagerDashboard} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="employees/:statName" element={<ProtectedRoute element={ManagerDashboardCardEmployees} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="employeeview" element={<ProtectedRoute element={ManagerEmployeeView} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="leave-tracking" element={<ProtectedRoute element={ManagerLeaveTracking} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="user-management" element={<ProtectedRoute element={ManagerUserManagement} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="site-view" element={<ProtectedRoute element={ManagerSiteView} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="employees" element={<ProtectedRoute element={ManagerEmployeePage} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="employee-update" element={<ProtectedRoute element={ManagerEmployeeUpdate} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="sites" element={<ProtectedRoute element={ManagerSiteMainPage} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="request-tracking" element={<ProtectedRoute element={ManagerRequestTracking} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="task-management" element={<ProtectedRoute element={ManagerTasks} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="task-update" element={<ProtectedRoute element={ManagerTaskUpdateForm} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="task-view" element={<ProtectedRoute element={ManagerTaskView} allowedRoles={['ROLE_MANAGER']} />} />
                        <Route path="attendance" element={<ProtectedRoute element={ManagerAttendancePage} allowedRoles={['ROLE_MANAGER']} />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
