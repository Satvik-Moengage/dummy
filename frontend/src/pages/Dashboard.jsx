import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Container,
    Typography,
    Paper,
    Box,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Button
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Person,
    Business,
    CheckCircle,
    Group,
    Settings
} from '@mui/icons-material';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 3 }}>
            <Container maxWidth="lg">
                {/* Welcome Section */}
                <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <DashboardIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Welcome to your Dashboard
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Manage your status page and monitor your services
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* User Info Section */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Person color="primary" />
                                <Typography variant="h6">User Information</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Email:</strong> {user?.email}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Role:</strong> {user?.role?.toUpperCase()}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Status:</strong> {user?.status?.toUpperCase()}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <strong>Member since:</strong> {new Date(user?.created_at).toLocaleDateString()}
                            </Typography>
                            <Chip 
                                label={user?.status === 'approved' ? 'Active' : user?.status?.toUpperCase()} 
                                color={user?.status === 'approved' ? 'success' : 'warning'} 
                                icon={<CheckCircle />} 
                            />
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Business color="primary" />
                                <Typography variant="h6">Organization</Typography>
                            </Box>
                            {user?.organization_id ? (
                                <>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Organization ID:</strong> {user.organization_id}
                                    </Typography>
                                    <Chip label="Organization Member" color="primary" />
                                </>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No organization assigned
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Quick Actions
                </Typography>
                
                {user?.role === 'admin' && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} 
                                  onClick={() => navigate('/team-management')}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Team Management
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Approve users and manage team roles
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
                                  onClick={() => navigate('/organization-settings')}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Settings sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Organization Settings
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Configure organization preferences
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Your status page management features will be available here. 
                    You can create services, manage incidents, and monitor system status.
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Chip label="Services: 0" variant="outlined" sx={{ mr: 1 }} />
                    <Chip label="Incidents: 0" variant="outlined" sx={{ mr: 1 }} />
                    <Chip label="Status: All Systems Operational" color="success" />
                </Box>
            </Paper>
            </Container>
        </Box>
    );
};

export default Dashboard;
