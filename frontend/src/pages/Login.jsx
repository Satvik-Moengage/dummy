import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Link as MuiLink,
    Paper
} from '@mui/material';
import { LoginOutlined } from '@mui/icons-material';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for success message from navigation state
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
        }
    }, [location.state]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await login(formData.email, formData.password);
        
        if (result.success) {
            navigate('/dashboard');
        } else {
            const errorMessage = result.error;
            
            // Check for specific error types and provide helpful messages
            if (errorMessage.includes('pending admin approval')) {
                setError({
                    type: 'warning',
                    message: 'Your account is pending approval. An administrator will review your request and approve access soon. Please check back later or contact your organization administrator.'
                });
            } else if (errorMessage.includes('access has been revoked')) {
                setError({
                    type: 'error',
                    message: 'Your access has been revoked. Please contact your organization administrator to restore your access.'
                });
            } else if (errorMessage.includes('not permitted')) {
                setError({
                    type: 'error',
                    message: 'Your account access is restricted. Please contact support for assistance.'
                });
            } else {
                setError({
                    type: 'error',
                    message: result.error
                });
            }
        }
        
        setLoading(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                padding: 2,
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 400,
                }}
            >
                <LoginOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                
                <Typography component="h1" variant="h4" gutterBottom>
                    Sign In
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Access your status page dashboard
                </Typography>
                
                {successMessage && (
                    <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
                        {successMessage}
                    </Alert>
                )}
                
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={formData.email}
                        onChange={handleChange}
                        variant="outlined"
                    />
                    
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        variant="outlined"
                    />
                    
                    {error && (
                        <Alert severity={error.type || "error"} sx={{ mt: 2 }}>
                            {error.message || error}
                        </Alert>
                    )}                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                    
                    <Box textAlign="center">
                        <Typography variant="body2">
                            Don't have an account?{' '}
                            <MuiLink component={Link} to="/register" underline="hover">
                                Sign up
                            </MuiLink>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;
