import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Paper,
  Divider,
  LinearProgress,
  Alert,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Info,
  Refresh,
  ExpandMore,
  Language,
  Schedule
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';

const PublicStatusPage = () => {
  const { orgIdentifier } = useParams();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchStatusData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatusData, 30000);
    return () => clearInterval(interval);
  }, [orgIdentifier]);

  const fetchStatusData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/status/organizations/${orgIdentifier}/status`);
      if (response.ok) {
        const data = await response.json();
        setStatusData(data);
        setError('');
        setLastUpdated(new Date());
      } else if (response.status === 404) {
        setError('Organization not found');
      } else {
        setError('Failed to fetch status data');
      }
    } catch (error) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle color="success" />;
      case 'degraded':
      case 'partial_outage':
        return <Warning color="warning" />;
      case 'major_outage':
        return <Error color="error" />;
      default:
        return <Info color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'success';
      case 'degraded':
      case 'partial_outage':
        return 'warning';
      case 'major_outage':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'partial_outage':
        return 'Partial Outage';
      case 'major_outage':
        return 'Major Outage';
      default:
        return 'Unknown';
    }
  };

  const getOverallStatusMessage = (status) => {
    switch (status) {
      case 'operational':
        return 'All systems are operational';
      case 'degraded':
        return 'Some systems are experiencing degraded performance';
      case 'major_outage':
        return 'Some systems are experiencing major outages';
      default:
        return 'Status unknown';
    }
  };

  const getIncidentStatusColor = (status) => {
    switch (status) {
      case 'investigating':
        return 'warning';
      case 'identified':
        return 'info';
      case 'monitoring':
        return 'primary';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => window.location.href = '/directory'}>
            Browse Organizations
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {statusData.organization.name}
            </Typography>
            {statusData.organization.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {statusData.organization.description}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={fetchStatusData}
            >
              Refresh
            </Button>
            {statusData.organization.website && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Language />}
                href={statusData.organization.website}
                target="_blank"
              >
                Website
              </Button>
            )}
          </Box>
        </Box>

        {/* Overall Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getStatusIcon(statusData.overall_status)}
          <Box>
            <Typography variant="h6">
              {getOverallStatusMessage(statusData.overall_status)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {format(lastUpdated, 'PPpp')}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Services Status */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Services
        </Typography>
        <List>
          {statusData.services.map((service, index) => (
            <React.Fragment key={service.id}>
              <ListItem>
                <ListItemIcon>
                  {getStatusIcon(service.status)}
                </ListItemIcon>
                <ListItemText
                  primary={service.name}
                  secondary={service.description}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ minWidth: 100 }}>
                    <Typography variant="body2" color="text.secondary">
                      {service.uptime_percentage.toFixed(1)}% uptime
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={service.uptime_percentage}
                      color={service.uptime_percentage >= 99 ? 'success' : service.uptime_percentage >= 95 ? 'warning' : 'error'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Chip
                    label={getStatusText(service.status)}
                    color={getStatusColor(service.status)}
                    size="small"
                  />
                </Box>
              </ListItem>
              {index < statusData.services.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
        
        {statusData.services.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No services configured yet.
          </Typography>
        )}
      </Paper>

      {/* Recent Incidents */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Recent Incidents (Last 30 days)
        </Typography>
        
        {statusData.incidents.length > 0 ? (
          <Box>
            {statusData.incidents.map((incident) => (
              <Accordion key={incident.id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Chip
                      label={incident.status}
                      color={getIncidentStatusColor(incident.status)}
                      size="small"
                    />
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>
                      {incident.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(incident.created_at), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {incident.description}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Impact: <strong>{incident.impact}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Status: <strong>{incident.status}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Started: {format(new Date(incident.created_at), 'PPpp')}
                        </Typography>
                      </Grid>
                      {incident.resolved_at && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Resolved: {format(new Date(incident.resolved_at), 'PPpp')}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ) : (
          <Alert severity="success" icon={<CheckCircle />}>
            No incidents reported in the last 30 days. All systems have been running smoothly!
          </Alert>
        )}
      </Paper>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          <Link to="/directory" style={{ textDecoration: 'none', color: 'inherit' }}>
            ← Browse all organizations
          </Link>
          {' • '}
          Powered by StatusPage
        </Typography>
      </Box>
    </Container>
  );
};

export default PublicStatusPage;
