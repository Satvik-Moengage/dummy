import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    Box,
    Grid,
    Card,
    CardContent,
    Chip,
    Divider,
    Alert,
    CircularProgress,
    Link
} from '@mui/material';
import {
    CheckCircle,
    Info,
    Timeline,
    Warning,
    Error as ErrorIcon,
    Build
} from '@mui/icons-material';
import axios from 'axios';

const DynamicStatusPage = () => {
    const { subdomain, orgId } = useParams();
    const [settings, setSettings] = useState(null);
    const [services, setServices] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStatusPageData();
    }, [subdomain, orgId]);

    const fetchStatusPageData = async () => {
        try {
            // Determine the endpoint based on whether we have subdomain or orgId
            let endpoint;
            if (subdomain) {
                endpoint = `http://127.0.0.1:8000/api/v1/public/status/${subdomain}`;
            } else if (orgId) {
                endpoint = `http://127.0.0.1:8000/api/v1/public/status/org/${orgId}`;
            }

            const response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                setSettings(data.settings);
                setServices(data.services || []);
                setIncidents(data.incidents || []);
            } else {
                setError('Status page not found');
            }
        } catch (err) {
            setError('Failed to load status page');
        } finally {
            setLoading(false);
        }
    };

    const getServiceStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'operational': return 'success';
            case 'degraded': return 'warning';
            case 'outage': return 'error';
            case 'maintenance': return 'info';
            default: return 'default';
        }
    };

    const getServiceStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'operational': return <CheckCircle />;
            case 'degraded': return <Warning />;
            case 'outage': return <ErrorIcon />;
            case 'maintenance': return <Build />;
            default: return <Info />;
        }
    };

    const getOverallStatus = () => {
        if (!statusPage?.services?.length) return { status: 'No Services', color: 'default', icon: <Info /> };
        
        const statuses = statusPage.services.map(s => s.status.toLowerCase());
        
        if (statuses.includes('outage')) {
            return { status: 'Major Outage', color: 'error', icon: <ErrorIcon /> };
        }
        if (statuses.includes('degraded')) {
            return { status: 'Degraded Performance', color: 'warning', icon: <Warning /> };
        }
        if (statuses.includes('maintenance')) {
            return { status: 'Under Maintenance', color: 'info', icon: <Build /> };
        }
        return { status: 'All Systems Operational', color: 'success', icon: <CheckCircle /> };
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    gap: 2
                }}
            >
                <CircularProgress size={50} />
                <Typography variant="h6" color="text.secondary">
                    Loading status page...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!statusPage) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="warning">
                    Status page not found
                </Alert>
            </Container>
        );
    }

    const overallStatus = getOverallStatus();

    return (
        <Box 
            sx={{ 
                backgroundColor: statusPage.background_color || '#f5f5f5',
                minHeight: '100vh',
                py: 3
            }}
        >
            {/* Custom CSS */}
            {statusPage.custom_css && (
                <style dangerouslySetInnerHTML={{ __html: statusPage.custom_css }} />
            )}
            
            <Container maxWidth="lg">
                {/* Header */}
                <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
                        {statusPage.logo_url && (
                            <img 
                                src={statusPage.logo_url} 
                                alt="Logo" 
                                style={{ height: 60, marginRight: 16 }}
                            />
                        )}
                        <Box>
                            <Typography variant="h3" component="h1" sx={{ color: statusPage.primary_color }}>
                                {statusPage.page_title}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                {statusPage.page_description}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Maintenance Mode Alert */}
                {statusPage.maintenance_mode && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Maintenance Mode</Typography>
                        {statusPage.maintenance_message}
                    </Alert>
                )}

                {/* Overall Status */}
                <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ color: `${overallStatus.color}.main`, fontSize: 40 }}>
                            {overallStatus.icon}
                        </Box>
                        <Typography variant="h4" component="h2" color={`${overallStatus.color}.main`}>
                            {overallStatus.status}
                        </Typography>
                    </Box>
                    <Typography variant="h6" color="text.secondary">
                        Last updated: {new Date().toLocaleString()}
                    </Typography>
                </Paper>

                {/* Services Status */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Timeline />
                        Services Status
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {statusPage.services.length > 0 ? (
                        <Grid container spacing={2}>
                            {statusPage.services.map((service) => (
                                <Grid item xs={12} sm={6} md={4} key={service.id}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {service.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip 
                                                    label={service.status}
                                                    color={getServiceStatusColor(service.status)}
                                                    icon={getServiceStatusIcon(service.status)}
                                                    size="small"
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography variant="body1" color="text.secondary" textAlign="center">
                            No services configured yet
                        </Typography>
                    )}
                </Paper>

                {/* Incident History */}
                {statusPage.show_incident_history && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Info />
                            Recent Incidents
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {statusPage.incidents.length > 0 ? (
                            statusPage.incidents.map((incident) => (
                                <Box key={incident.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {incident.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {incident.message}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Chip label={incident.status} size="small" />
                                        <Typography variant="caption">
                                            {new Date(incident.created_at).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No incidents reported in the last 30 days
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    All systems have been running smoothly
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                )}

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 4, py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {statusPage.organization_name} Status Page
                        {statusPage.contact_email && (
                            <>
                                {' • '}
                                <Link href={`mailto:${statusPage.contact_email}`}>
                                    Contact Support
                                </Link>
                            </>
                        )}
                        {statusPage.support_url && (
                            <>
                                {' • '}
                                <Link href={statusPage.support_url} target="_blank" rel="noopener">
                                    Support Center
                                </Link>
                            </>
                        )}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default DynamicStatusPage;
