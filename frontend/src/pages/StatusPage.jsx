import React from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    Grid,
    Card,
    CardContent,
    Chip,
    Divider
} from '@mui/material';
import {
    CheckCircle,
    Info,
    Timeline
} from '@mui/icons-material';

const StatusPage = () => {
    // Mock data for demonstration
    const services = [
        { name: 'API Service', status: 'operational', uptime: '99.9%' },
        { name: 'Web Application', status: 'operational', uptime: '99.8%' },
        { name: 'Database', status: 'operational', uptime: '99.9%' },
        { name: 'CDN', status: 'operational', uptime: '100%' }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'operational': return 'success';
            case 'degraded': return 'warning';
            case 'outage': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 3 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                    <Typography variant="h3" component="h1">
                        All Systems Operational
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    Last updated: {new Date().toLocaleString()}
                </Typography>
            </Paper>

            {/* Current Status */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Timeline />
                    Current Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                    {services.map((service, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {service.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Chip 
                                            label={service.status} 
                                            color={getStatusColor(service.status)}
                                            size="small"
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            Uptime: {service.uptime}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Incident History */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info />
                    Recent Incidents
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                        No incidents reported in the last 30 days
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        All systems have been running smoothly
                    </Typography>
                </Box>
            </Paper>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4, py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Status Page - Powered by Status Page Application
                </Typography>
            </Box>
            </Container>
        </Box>
    );
};

export default StatusPage;
