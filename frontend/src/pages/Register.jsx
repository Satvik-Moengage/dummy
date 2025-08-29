import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Link as MuiLink,
    Divider,
    Container
} from '@mui/material';
import { PersonAddOutlined, Business, Search } from '@mui/icons-material';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        organization_id: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [organizationInfo, setOrganizationInfo] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        
        // Reset organization info when org ID changes
        if (e.target.name === 'organization_id') {
            setOrganizationInfo(null);
        }
    };

    const lookupOrganization = async () => {
        if (!formData.organization_id.trim()) {
            setError('Please enter an Organization ID');
            return;
        }

        setLookupLoading(true);
        setError('');

        try {
            const response = await api.get(`/team/organization/${formData.organization_id}`);
            setOrganizationInfo(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Organization not found');
            setOrganizationInfo(null);
        } finally {
            setLookupLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate required fields
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.organization_id) {
            setError('Please fill in all required fields');
            return;
        }

        // Validate organization lookup was successful
        if (!organizationInfo) {
            setError('Please lookup and verify your Organization ID first');
            return;
        }

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        const userData = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            password: formData.password,
            organization_id: formData.organization_id
        };

        const result = await register(userData);
        
        if (result.success) {
            navigate('/login', { 
                state: { message: 'Registration successful! Your account is pending admin approval.' }
            });
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Box textAlign="center" sx={{ mb: 4 }}>
                <Typography variant="h3" gutterBottom>
                    Join Status Page
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Choose how you'd like to get started
                </Typography>
            </Box>

            {/* Organization Registration Option */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mb: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    color: 'white'
                }}
            >
                <Business sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                    Register New Organization
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Set up a new status page for your organization with full administrative control
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register-organization')}
                    sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                            bgcolor: 'grey.100'
                        }
                    }}
                >
                    Register Organization
                </Button>
            </Paper>

            <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    OR
                </Typography>
            </Divider>

            {/* Individual User Registration */}
            <Paper
                elevation={2}
                sx={{
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <PersonAddOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                
                <Typography component="h1" variant="h5" gutterBottom>
                    Join Existing Organization
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    Create a personal account to join an existing organization
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    {/* Organization ID Lookup */}
                    <Box sx={{ mb: 3 }}>
                        <Box display="flex" gap={1} alignItems="flex-end">
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="organization_id"
                                label="Organization ID"
                                name="organization_id"
                                value={formData.organization_id}
                                onChange={handleChange}
                                variant="outlined"
                                helperText="Enter your organization's unique ID"
                            />
                            <Button
                                variant="outlined"
                                onClick={lookupOrganization}
                                disabled={lookupLoading || !formData.organization_id.trim()}
                                sx={{ mb: 1, minWidth: 100 }}
                                startIcon={lookupLoading ? <CircularProgress size={16} /> : <Search />}
                            >
                                {lookupLoading ? 'Lookup' : 'Lookup'}
                            </Button>
                        </Box>
                        
                        {organizationInfo && (
                            <Alert severity="success" sx={{ mt: 1 }}>
                                <Typography variant="subtitle2">
                                    {organizationInfo.name}
                                </Typography>
                                <Typography variant="body2">
                                    {organizationInfo.description}
                                </Typography>
                            </Alert>
                        )}
                    </Box>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="first_name"
                        label="First Name"
                        name="first_name"
                        autoComplete="given-name"
                        value={formData.first_name}
                        onChange={handleChange}
                        variant="outlined"
                    />
                    
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="last_name"
                        label="Last Name"
                        name="last_name"
                        autoComplete="family-name"
                        value={formData.last_name}
                        onChange={handleChange}
                        variant="outlined"
                    />
                    
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
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
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        variant="outlined"
                        helperText="Must be at least 6 characters"
                    />
                    
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        variant="outlined"
                    />
                    
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        disabled={loading || !organizationInfo}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        {loading ? 'Creating Account...' : 'Join Organization'}
                    </Button>
                    
                    <Box textAlign="center">
                        <Typography variant="body2">
                            Already have an account?{' '}
                            <MuiLink component={Link} to="/login" underline="hover">
                                Sign in
                            </MuiLink>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;
