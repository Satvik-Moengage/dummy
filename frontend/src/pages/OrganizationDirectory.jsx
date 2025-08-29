import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search, OpenInNew, Language } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const OrganizationDirectory = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/status/organizations`);
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      } else {
        setError('Failed to fetch organizations');
      }
    } catch (error) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'partial_outage':
        return 'warning';
      case 'major_outage':
        return 'error';
      case 'maintenance':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'operational':
        return 'All Systems Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'partial_outage':
        return 'Partial Outage';
      case 'major_outage':
        return 'Major Outage';
      case 'maintenance':
        return 'Under Maintenance';
      default:
        return `Status: ${status || 'Unknown'}`;
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewStatusPage = (org) => {
    navigate(`/status/${org.id}`);
  };  const handleVisitWebsite = (org) => {
    if (org.website) {
      window.open(org.website, '_blank');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Status Page Directory
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Monitor the status of services from multiple organizations
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600, mx: 'auto', display: 'block' }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {filteredOrganizations.map((org) => (
          <Grid item xs={12} sm={6} md={4} key={org.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" noWrap sx={{ flex: 1 }}>
                    {org.name}
                  </Typography>
                  <Chip
                    label={getStatusText(org.status)}
                    color={getStatusColor(org.status)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
                
                {org.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {org.description}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  {org.service_count} service{org.service_count !== 1 ? 's' : ''} monitored
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleViewStatusPage(org)}
                  startIcon={<OpenInNew />}
                >
                  View Status
                </Button>
                
                {org.website && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleVisitWebsite(org)}
                    startIcon={<Language />}
                  >
                    Website
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredOrganizations.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No organizations found matching your search.' : 'No organizations available.'}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default OrganizationDirectory;
