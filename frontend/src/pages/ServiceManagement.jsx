import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CheckCircle,
  Warning,
  Error,
  Info
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';

const ServiceManagement = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'operational'
  });
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuService, setMenuService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await apiClient.get('/organization/services');
      setServices(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async () => {
    try {
      await apiClient.post('/organization/services', formData);
      setSuccess('Service created successfully');
      setCreateDialogOpen(false);
      setFormData({ name: '', description: '', status: 'operational' });
      fetchServices();
    } catch (error) {
      console.error('Error creating service:', error);
      setError(error.response?.data?.detail || 'Failed to create service');
    }
  };

  const handleUpdateService = async () => {
    try {
      await apiClient.put(`/organization/services/${selectedService.id}`, formData);
      setSuccess('Service updated successfully');
      setEditDialogOpen(false);
      setSelectedService(null);
      setFormData({ name: '', description: '', status: 'operational' });
      fetchServices();
    } catch (error) {
      console.error('Error updating service:', error);
      setError(error.response?.data?.detail || 'Failed to update service');
    }
  };

  const handleDeleteService = async () => {
    try {
      await apiClient.delete(`/organization/services/${selectedService.id}`);
      setSuccess('Service deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      setError(error.response?.data?.detail || 'Failed to delete service');
    }
  };

  const handleStatusChange = async (serviceId, newStatus) => {
    try {
      await apiClient.patch(`/organization/services/${serviceId}/status?status=${newStatus}`);
      setSuccess('Service status updated successfully');
      fetchServices();
    } catch (error) {
      console.error('Error updating service status:', error);
      setError(error.response?.data?.detail || 'Failed to update service status');
    }
  };

  const openCreateDialog = () => {
    setFormData({ name: '', description: '', status: 'operational' });
    setCreateDialogOpen(true);
  };

  const openEditDialog = (service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      status: service.status
    });
    setEditDialogOpen(true);
    setAnchorEl(null);
  };

  const openDeleteDialog = (service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, service) => {
    setAnchorEl(event.currentTarget);
    setMenuService(service);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuService(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle color="success" />;
      case 'degraded':
        return <Warning color="warning" />;
      case 'partial_outage':
        return <Error color="error" />;
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
        return 'warning';
      case 'partial_outage':
        return 'error';
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
        return 'Degraded';
      case 'partial_outage':
        return 'Partial Outage';
      case 'major_outage':
        return 'Major Outage';
      default:
        return 'Unknown';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Access denied. Only administrators can manage services.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Service Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
        >
          Add Service
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {services.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No services configured yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first service to start monitoring your systems
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Create Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" noWrap sx={{ flex: 1 }}>
                      {service.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, service)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  {service.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {service.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {getStatusIcon(service.status)}
                    <Chip
                      label={getStatusText(service.status)}
                      color={getStatusColor(service.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Uptime: {service.uptime_percentage?.toFixed(1) || '99.9'}%
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={service.status}
                      label="Status"
                      onChange={(e) => handleStatusChange(service.id, e.target.value)}
                    >
                      <MenuItem value="operational">Operational</MenuItem>
                      <MenuItem value="degraded">Degraded</MenuItem>
                      <MenuItem value="partial_outage">Partial Outage</MenuItem>
                      <MenuItem value="major_outage">Major Outage</MenuItem>
                    </Select>
                  </FormControl>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => openEditDialog(menuService)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Service</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openDeleteDialog(menuService)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Service</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Service Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Service</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Service Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Initial Status</InputLabel>
            <Select
              value={formData.status}
              label="Initial Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="operational">Operational</MenuItem>
              <MenuItem value="degraded">Degraded</MenuItem>
              <MenuItem value="partial_outage">Partial Outage</MenuItem>
              <MenuItem value="major_outage">Major Outage</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateService} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Service</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Service Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="operational">Operational</MenuItem>
              <MenuItem value="degraded">Degraded</MenuItem>
              <MenuItem value="partial_outage">Partial Outage</MenuItem>
              <MenuItem value="major_outage">Major Outage</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateService} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Service Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedService?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteService} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ServiceManagement;
