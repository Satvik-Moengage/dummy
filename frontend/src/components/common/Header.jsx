import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Avatar
} from '@mui/material';
import { 
    Dashboard as DashboardIcon,
    AccountCircle,
    ExitToApp,
    Settings,
    Group,
    CloudQueue,
    BugReport
} from '@mui/icons-material';

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        handleClose();
    };

    return (
        <AppBar position="sticky" elevation={2}>
            <Toolbar>
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 600
                    }}
                >
                    Status Page
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Public navigation */}
                    <Button
                        color="inherit"
                        component={Link}
                        to="/directory"
                    >
                        Browse Organizations
                    </Button>
                    
                    <Button
                        color="inherit"
                        component={Link}
                        to="/timeline"
                    >
                        Incident Timeline
                    </Button>
                    
                    {isAuthenticated ? (
                        <>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/dashboard"
                                startIcon={<DashboardIcon />}
                            >
                                Dashboard
                            </Button>
                            
                            {user?.role === 'admin' && (
                                <>
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/services"
                                        startIcon={<CloudQueue />}
                                    >
                                        Services
                                    </Button>
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/incidents"
                                        startIcon={<BugReport />}
                                    >
                                        Incidents
                                    </Button>
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/team-management"
                                        startIcon={<Group />}
                                    >
                                        Team
                                    </Button>
                                </>
                            )}
                            
                            <IconButton
                                size="large"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                    {user?.email?.charAt(0).toUpperCase()}
                                </Avatar>
                            </IconButton>
                            
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem disabled>
                                    <Typography variant="body2" color="text.secondary">
                                        {user?.email}
                                    </Typography>
                                </MenuItem>
                                {user?.role === 'admin' && (
                                    <>
                                        <MenuItem component={Link} to="/services" onClick={handleClose}>
                                            <CloudQueue sx={{ mr: 1 }} />
                                            Services
                                        </MenuItem>
                                        <MenuItem component={Link} to="/incidents" onClick={handleClose}>
                                            <BugReport sx={{ mr: 1 }} />
                                            Incidents
                                        </MenuItem>
                                        <MenuItem component={Link} to="/team-management" onClick={handleClose}>
                                            <Group sx={{ mr: 1 }} />
                                            Team Management
                                        </MenuItem>
                                    </>
                                )}
                                <MenuItem component={Link} to="/settings" onClick={handleClose}>
                                    <Settings sx={{ mr: 1 }} />
                                    Settings
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <ExitToApp sx={{ mr: 1 }} />
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/login"
                                startIcon={<AccountCircle />}
                            >
                                Login
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                component={Link}
                                to="/register"
                                sx={{ mr: 1 }}
                            >
                                Sign Up
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                component={Link}
                                to="/register-organization"
                            >
                                Start Organization
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
