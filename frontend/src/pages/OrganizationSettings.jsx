import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Container,
    Typography,
    Paper,
    Box,
    Grid,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Alert,
    Divider,
    Card,
    CardContent,
    CircularProgress,
    Chip
} from '@mui/material';
import {
    Settings,
    Palette,
    Language,
    Link as LinkIcon,
    Save
} from '@mui/icons-material';
import { authAPI } from '../services/api';

const OrganizationSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        page_title: '',
        page_description: '',
        subdomain: '',
        custom_domain: '',
        logo_url: '',
        primary_color: '#1976d2',
        background_color: '#f5f5f5',
        custom_css: '',
        show_incident_history: true,
        show_uptime_stats: true,
        maintenance_mode: false,
        maintenance_message: '',
        contact_email: '',
        support_url: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            if (response.data.organization_id) {
                try {
                    const settingsResponse = await fetch(`http://127.0.0.1:8000/api/v1/organizations/settings`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (settingsResponse.ok) {
                        const data = await settingsResponse.json();
                        setSettings(data);
                    }
                } catch (err) {
                    // Settings don't exist yet, use defaults
                }
            }
        } catch (err) {
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/organizations/settings`, {
                method: settings.id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                const data = await response.json();
                setSettings(data);
                setMessage('Settings saved successfully!');
            } else {
                setError('Failed to save settings');
            }
        } catch (err) {
            setError('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getStatusPageUrl = () => {
        if (settings.custom_domain) {
            return `https://${settings.custom_domain}`;
        }
        if (settings.subdomain) {
            return `${window.location.origin}/status/${settings.subdomain}`;
        }
        if (user?.organization_id) {
            return `${window.location.origin}/status/org/${user.organization_id}`;
        }
        return 'Not configured';
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 3 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Settings />
                    Organization Settings
                </Typography>

                {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {/* Status Page URL */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinkIcon />
                            Status Page URL
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1">
                                {getStatusPageUrl()}
                            </Typography>
                            <Chip 
                                label="Public" 
                                color="success" 
                                size="small"
                                onClick={() => window.open(getStatusPageUrl(), '_blank')}
                                clickable
                            />
                        </Box>
                    </CardContent>
                </Card>

                <Grid container spacing={3}>
                    {/* Basic Settings */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Basic Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <TextField
                                fullWidth
                                label="Page Title"
                                value={settings.page_title}
                                onChange={handleChange('page_title')}
                                margin="normal"
                            />
                            
                            <TextField
                                fullWidth
                                label="Page Description"
                                value={settings.page_description}
                                onChange={handleChange('page_description')}
                                margin="normal"
                                multiline
                                rows={2}
                            />
                            
                            <TextField
                                fullWidth
                                label="Contact Email"
                                value={settings.contact_email}
                                onChange={handleChange('contact_email')}
                                margin="normal"
                                type="email"
                            />
                            
                            <TextField
                                fullWidth
                                label="Support URL"
                                value={settings.support_url}
                                onChange={handleChange('support_url')}
                                margin="normal"
                                type="url"
                            />
                        </Paper>
                    </Grid>

                    {/* Domain Settings */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Domain Settings
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <TextField
                                fullWidth
                                label="Subdomain"
                                value={settings.subdomain}
                                onChange={handleChange('subdomain')}
                                margin="normal"
                                helperText="e.g., 'mycompany' for mycompany.statuspage.app"
                            />
                            
                            <TextField
                                fullWidth
                                label="Custom Domain"
                                value={settings.custom_domain}
                                onChange={handleChange('custom_domain')}
                                margin="normal"
                                helperText="e.g., status.mycompany.com"
                            />
                            
                            <TextField
                                fullWidth
                                label="Logo URL"
                                value={settings.logo_url}
                                onChange={handleChange('logo_url')}
                                margin="normal"
                                type="url"
                            />
                        </Paper>
                    </Grid>

                    {/* Appearance */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Palette />
                                Appearance
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <TextField
                                fullWidth
                                label="Primary Color"
                                value={settings.primary_color}
                                onChange={handleChange('primary_color')}
                                margin="normal"
                                type="color"
                            />
                            
                            <TextField
                                fullWidth
                                label="Background Color"
                                value={settings.background_color}
                                onChange={handleChange('background_color')}
                                margin="normal"
                                type="color"
                            />
                            
                            <TextField
                                fullWidth
                                label="Custom CSS"
                                value={settings.custom_css}
                                onChange={handleChange('custom_css')}
                                margin="normal"
                                multiline
                                rows={4}
                                placeholder="/* Add custom CSS here */"
                            />
                        </Paper>
                    </Grid>

                    {/* Features */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Features
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.show_incident_history}
                                        onChange={handleChange('show_incident_history')}
                                    />
                                }
                                label="Show Incident History"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.show_uptime_stats}
                                        onChange={handleChange('show_uptime_stats')}
                                    />
                                }
                                label="Show Uptime Statistics"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.maintenance_mode}
                                        onChange={handleChange('maintenance_mode')}
                                    />
                                }
                                label="Maintenance Mode"
                            />
                            
                            {settings.maintenance_mode && (
                                <TextField
                                    fullWidth
                                    label="Maintenance Message"
                                    value={settings.maintenance_message}
                                    onChange={handleChange('maintenance_message')}
                                    margin="normal"
                                    multiline
                                    rows={2}
                                />
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* Save Button */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSave}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default OrganizationSettings;
