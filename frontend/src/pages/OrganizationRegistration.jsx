import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Divider
} from '@mui/material';
import {
    Business,
    Person,
    CheckCircle,
    Info
} from '@mui/icons-material';
import { organizationAPI } from '../services/api';

const OrganizationRegistration = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [subscriptionValidating, setSubscriptionValidating] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [subscriptionValid, setSubscriptionValid] = useState(false);
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);

    const [formData, setFormData] = useState({
        // Organization details
        name: '',
        description: '',
        website: '',
        industry: '',
        company_size: '',
        phone: '',
        address: '',
        subscription_code: '',
        
        // Admin user details
        admin_user: {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirm_password: ''
        }
    });

    const steps = ['Subscription Code', 'Organization Details', 'Admin User', 'Review & Submit'];

    const industries = [
        'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
        'Manufacturing', 'Transportation', 'Real Estate', 'Media',
        'Government', 'Non-profit', 'Other'
    ];

    const companySizes = [
        '1-10 employees',
        '11-50 employees', 
        '51-200 employees',
        '201-500 employees',
        '501-1000 employees',
        '1000+ employees'
    ];

    const handleInputChange = (section, field) => (event) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: event.target.value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: event.target.value
            }));
        }
        
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateSubscriptionCode = async () => {
        if (!formData.subscription_code.trim()) {
            setError('Please enter a subscription code');
            return;
        }

        setSubscriptionValidating(true);
        setError('');

        try {
            const response = await organizationAPI.validateSubscription(formData.subscription_code);
            if (response.data.valid) {
                setSubscriptionValid(true);
                setSubscriptionDetails(response.data);
                setMessage(`${response.data.plan_name} activated successfully!`);
                setTimeout(() => setActiveStep(1), 1500);
            } else {
                setError(response.data.message || 'Invalid subscription code');
                setSubscriptionValid(false);
                setSubscriptionDetails(null);
            }
        } catch (err) {
            setError('Failed to validate subscription code');
            setSubscriptionValid(false);
            setSubscriptionDetails(null);
        } finally {
            setSubscriptionValidating(false);
        }
    };

    const validateStep = (step) => {
        switch (step) {
            case 0:
                return subscriptionValid;
            case 1:
                return formData.name.trim() && formData.industry;
            case 2:
                return formData.admin_user.first_name.trim() && 
                       formData.admin_user.last_name.trim() &&
                       formData.admin_user.email.trim() &&
                       formData.admin_user.password.length >= 6 &&
                       formData.admin_user.password === formData.admin_user.confirm_password;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep(prev => prev + 1);
            setError('');
        } else {
            setError('Please fill in all required fields correctly');
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
        setError('');
    };

    const handleSubmit = async () => {
        if (!validateStep(2)) {
            setError('Please fill in all required fields correctly');
            return;
        }

        if (formData.admin_user.password !== formData.admin_user.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const registrationData = {
                ...formData,
                admin_user: {
                    first_name: formData.admin_user.first_name,
                    last_name: formData.admin_user.last_name,
                    email: formData.admin_user.email,
                    password: formData.admin_user.password
                }
            };

            const response = await organizationAPI.registerOrganization(registrationData);
            setMessage(response.data.message);
            
            setTimeout(() => {
                navigate('/login', { 
                    state: { 
                        message: 'Organization registered successfully! Please log in with your admin credentials.' 
                    }
                });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to register organization');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Enter Subscription Code
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Please enter your subscription code to activate your status page plan.
                        </Typography>
                        
                        <TextField
                            fullWidth
                            label="Subscription Code"
                            value={formData.subscription_code}
                            onChange={handleInputChange(null, 'subscription_code')}
                            margin="normal"
                            placeholder="e.g., STARTUP2024"
                            disabled={subscriptionValid}
                        />
                        
                        {subscriptionDetails && (
                            <Box sx={{ mt: 2 }}>
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2">{subscriptionDetails.plan_name}</Typography>
                                    <Typography variant="body2">{subscriptionDetails.message}</Typography>
                                </Alert>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Features included:</strong>
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {subscriptionDetails.features?.map((feature, index) => (
                                        <Chip key={index} label={feature} size="small" color="primary" variant="outlined" />
                                    ))}
                                </Box>
                            </Box>
                        )}
                        
                        {!subscriptionValid && (
                            <Button
                                variant="contained"
                                onClick={validateSubscriptionCode}
                                disabled={subscriptionValidating || !formData.subscription_code.trim()}
                                sx={{ mt: 2 }}
                                startIcon={subscriptionValidating ? <CircularProgress size={20} /> : <CheckCircle />}
                            >
                                {subscriptionValidating ? 'Validating...' : 'Validate Code'}
                            </Button>
                        )}
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Business />
                            Organization Details
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Organization Name *"
                                    value={formData.name}
                                    onChange={handleInputChange(null, 'name')}
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    value={formData.description}
                                    onChange={handleInputChange(null, 'description')}
                                    margin="normal"
                                    multiline
                                    rows={2}
                                    placeholder="Brief description of your organization"
                                />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Website"
                                    value={formData.website}
                                    onChange={handleInputChange(null, 'website')}
                                    margin="normal"
                                    placeholder="https://example.com"
                                />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={handleInputChange(null, 'phone')}
                                    margin="normal"
                                />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel>Industry</InputLabel>
                                    <Select
                                        value={formData.industry}
                                        onChange={handleInputChange(null, 'industry')}
                                        label="Industry"
                                    >
                                        {industries.map((industry) => (
                                            <MenuItem key={industry} value={industry}>
                                                {industry}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Company Size</InputLabel>
                                    <Select
                                        value={formData.company_size}
                                        onChange={handleInputChange(null, 'company_size')}
                                        label="Company Size"
                                    >
                                        {companySizes.map((size) => (
                                            <MenuItem key={size} value={size}>
                                                {size}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    value={formData.address}
                                    onChange={handleInputChange(null, 'address')}
                                    margin="normal"
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person />
                            Admin User Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            This user will be the administrator of your organization.
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="First Name *"
                                    value={formData.admin_user.first_name}
                                    onChange={handleInputChange('admin_user', 'first_name')}
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name *"
                                    value={formData.admin_user.last_name}
                                    onChange={handleInputChange('admin_user', 'last_name')}
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email *"
                                    type="email"
                                    value={formData.admin_user.email}
                                    onChange={handleInputChange('admin_user', 'email')}
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Password *"
                                    type="password"
                                    value={formData.admin_user.password}
                                    onChange={handleInputChange('admin_user', 'password')}
                                    margin="normal"
                                    required
                                    helperText="Minimum 6 characters"
                                />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Confirm Password *"
                                    type="password"
                                    value={formData.admin_user.confirm_password}
                                    onChange={handleInputChange('admin_user', 'confirm_password')}
                                    margin="normal"
                                    required
                                    error={formData.admin_user.password !== formData.admin_user.confirm_password && formData.admin_user.confirm_password !== ''}
                                    helperText={formData.admin_user.password !== formData.admin_user.confirm_password && formData.admin_user.confirm_password !== '' ? 'Passwords do not match' : ''}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Review & Submit
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Please review your information before submitting.
                        </Typography>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Organization</strong>
                                    </Typography>
                                    <Typography variant="body2"><strong>Name:</strong> {formData.name}</Typography>
                                    <Typography variant="body2"><strong>Industry:</strong> {formData.industry}</Typography>
                                    {formData.website && <Typography variant="body2"><strong>Website:</strong> {formData.website}</Typography>}
                                    {formData.company_size && <Typography variant="body2"><strong>Size:</strong> {formData.company_size}</Typography>}
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Admin User</strong>
                                    </Typography>
                                    <Typography variant="body2"><strong>Name:</strong> {formData.admin_user.first_name} {formData.admin_user.last_name}</Typography>
                                    <Typography variant="body2"><strong>Email:</strong> {formData.admin_user.email}</Typography>
                                    <Typography variant="body2"><strong>Role:</strong> Administrator</Typography>
                                </Paper>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Subscription Plan</strong>
                                    </Typography>
                                    <Typography variant="body2"><strong>Plan:</strong> {subscriptionDetails?.plan_name}</Typography>
                                    <Typography variant="body2"><strong>Code:</strong> {formData.subscription_code}</Typography>
                                    <Box sx={{ mt: 1 }}>
                                        {subscriptionDetails?.features?.map((feature, index) => (
                                            <Chip key={index} label={feature} size="small" sx={{ mr: 1, mb: 1 }} />
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom textAlign="center" sx={{ mb: 4 }}>
                    Register Your Organization
                </Typography>

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {renderStepContent(activeStep)}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                    >
                        Back
                    </Button>

                    <Box>
                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading || !validateStep(2)}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                {loading ? 'Registering...' : 'Register Organization'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={!validateStep(activeStep)}
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />
                
                <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                        Already have an account?{' '}
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <Button variant="text">Sign In</Button>
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default OrganizationRegistration;
