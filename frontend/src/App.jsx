import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import ProtectedRoute from './components/common/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import StatusPage from './pages/StatusPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OrganizationRegistration from './pages/OrganizationRegistration';
import DynamicStatusPage from './pages/DynamicStatusPage';
import OrganizationSettings from './pages/OrganizationSettings';
import TeamManagement from './pages/TeamManagement';
import ServiceManagement from './pages/ServiceManagement';
import IncidentManagement from './pages/IncidentManagement';
import OrganizationDirectory from './pages/OrganizationDirectory';
import PublicStatusPage from './pages/PublicStatusPage';
import IncidentTimeline from './pages/IncidentTimeline';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
        },
        '#root': {
          width: '100%',
          height: '100vh',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                {/* Public routes - no authentication required */}
                <Route path="/" element={<StatusPage />} />
                <Route path="/directory" element={<OrganizationDirectory />} />
                <Route path="/status/:orgIdentifier" element={<PublicStatusPage />} />
                <Route path="/timeline/:orgIdentifier?" element={<IncidentTimeline />} />
                
                {/* Authentication routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register-organization" element={<OrganizationRegistration />} />
                
                {/* Legacy status page routes */}
                <Route path="/status/org/:orgId" element={<DynamicStatusPage />} />
                
                {/* Protected routes - authentication required */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/team-management" 
                  element={
                    <ProtectedRoute>
                      <TeamManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/services" 
                  element={
                    <ProtectedRoute>
                      <ServiceManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/incidents" 
                  element={
                    <ProtectedRoute>
                      <IncidentManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <OrganizationSettings />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
