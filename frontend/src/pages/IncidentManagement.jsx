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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ExpandMore,
  Warning,
  Error,
  Info,
  CheckCircle,
  Timeline,
  BugReport
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { format } from 'date-fns';

const IncidentManagement = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [activeIncidentCount, setActiveIncidentCount] = useState(0);
  const [totalIncidentCount, setTotalIncidentCount] = useState(0);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    impact: 'medium',
    service_id: ''
  });
  
  const [statusFormData, setStatusFormData] = useState({
    status: 'investigating',
    update_message: ''
  });
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuIncident, setMenuIncident] = useState(null);

  useEffect(() => {
    fetchIncidents();
    fetchServices();
    fetchIncidentCounts();
  }, [tabValue]);

  useEffect(() => {
    // Fetch counts on initial load
    fetchIncidentCounts();
  }, []);

  const fetchIncidentCounts = async () => {
    try {
      // Fetch active incidents count
      const activeResponse = await apiClient.get('/organization/incidents?active_only=true');
      setActiveIncidentCount(activeResponse.data.length);
      
      // Fetch all incidents count
      const allResponse = await apiClient.get('/organization/incidents?active_only=false');
      setTotalIncidentCount(allResponse.data.length);
    } catch (error) {
      console.error('Error fetching incident counts:', error);
    }
  };

  const fetchIncidents = async () => {
    try {
      const activeOnly = tabValue === 0; // Tab 0 = Active incidents, Tab 1 = All incidents
      const response = await apiClient.get(`/organization/incidents?active_only=${activeOnly}`);
      setIncidents(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setError('Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await apiClient.get('/organization/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleCreateIncident = async () => {
    try {
      await apiClient.post('/organization/incidents', formData);
      setSuccess('Incident created successfully');
      setCreateDialogOpen(false);
      setFormData({ title: '', description: '', impact: 'medium', service_id: '' });
      fetchIncidents();
      fetchIncidentCounts();
    } catch (error) {
      console.error('Error creating incident:', error);
      setError(error.response?.data?.detail || 'Failed to create incident');
    }
  };

  const handleUpdateIncident = async () => {
    try {
      await apiClient.put(`/organization/incidents/${selectedIncident.id}`, formData);
      setSuccess('Incident updated successfully');
      setEditDialogOpen(false);
      setSelectedIncident(null);
      setFormData({ title: '', description: '', impact: 'medium', service_id: '' });
      fetchIncidents();
      fetchIncidentCounts();
    } catch (error) {
      console.error('Error updating incident:', error);
      setError(error.response?.data?.detail || 'Failed to update incident');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await apiClient.patch(`/organization/incidents/${selectedIncident.id}/status`, statusFormData);
      setSuccess('Incident status updated successfully');
      setStatusDialogOpen(false);
      setSelectedIncident(null);
      setStatusFormData({ status: 'investigating', update_message: '' });
      fetchIncidents();
      fetchIncidentCounts();
    } catch (error) {
      console.error('Error updating incident status:', error);
      setError(error.response?.data?.detail || 'Failed to update incident status');
    }
  };

  const handleDeleteIncident = async () => {
    try {
      await apiClient.delete(`/organization/incidents/${selectedIncident.id}`);
      setSuccess('Incident deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedIncident(null);
      fetchIncidents();
      fetchIncidentCounts();
    } catch (error) {
      console.error('Error deleting incident:', error);
      setError(error.response?.data?.detail || 'Failed to delete incident');
    }
  };

  const openCreateDialog = () => {
    setFormData({ title: '', description: '', impact: 'medium', service_id: '' });
    setCreateDialogOpen(true);
  };

  const openEditDialog = (incident) => {
    setSelectedIncident(incident);
    setFormData({
      title: incident.title,
      description: incident.description,
      impact: incident.impact,
      service_id: incident.service_id
    });
    setEditDialogOpen(true);
    setAnchorEl(null);
  };

  const openStatusDialog = (incident) => {
    setSelectedIncident(incident);
    setStatusFormData({ status: incident.status, update_message: '' });
    setStatusDialogOpen(true);
    setAnchorEl(null);
  };

  const openDeleteDialog = (incident) => {
    setSelectedIncident(incident);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, incident) => {
    setAnchorEl(event.currentTarget);
    setMenuIncident(incident);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIncident(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'investigating':
        return <Info color="warning" />;
      case 'identified':
        return <Warning color="warning" />;
      case 'monitoring':
        return <Timeline color="info" />;
      case 'resolved':
        return <CheckCircle color="success" />;
      default:
        return <BugReport color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'investigating':
        return 'warning';
      case 'identified':
        return 'warning';
      case 'monitoring':
        return 'info';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getImpactText = (impact) => {
    return impact.charAt(0).toUpperCase() + impact.slice(1);
  };

  if (user?.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Access denied. Only administrators can manage incidents.
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
          Incident Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          disabled={services.length === 0}
        >
          Report Incident
        </Button>
      </Box>

      {services.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You need to create services before you can report incidents. 
          <Button component="a" href="/services" sx={{ ml: 1 }}>
            Create Services
          </Button>
        </Alert>
      )}

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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Active Incidents (${activeIncidentCount})`} />
          <Tab label={`All Incidents (${totalIncidentCount})`} />
        </Tabs>
      </Box>

      {incidents.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {tabValue === 0 ? 'No active incidents' : 'No incidents found'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {tabValue === 0 
                ? 'When issues occur with your services, create incidents to keep your users informed'
                : 'No incidents have been created yet for this organization'
              }
            </Typography>
            {services.length > 0 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
              >
                Report New Incident
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Impact</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{incident.title}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {incident.description.substring(0, 100)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{incident.service_name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(incident.status)}
                      <Chip
                        label={getStatusText(incident.status)}
                        color={getStatusColor(incident.status)}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getImpactText(incident.impact)}
                      color={getImpactColor(incident.impact)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(incident.created_at), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, incident)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => openStatusDialog(menuIncident)}>
          <ListItemIcon>
            <Timeline fontSize="small" />
          </ListItemIcon>
          <ListItemText>Update Status</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openEditDialog(menuIncident)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Incident</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openDeleteDialog(menuIncident)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Incident</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Incident Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Report New Incident</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Incident Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Affected Service</InputLabel>
            <Select
              value={formData.service_id}
              label="Affected Service"
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Impact Level</InputLabel>
            <Select
              value={formData.impact}
              label="Impact Level"
              onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
            >
              <MenuItem value="low">Low - Minor issues</MenuItem>
              <MenuItem value="medium">Medium - Noticeable impact</MenuItem>
              <MenuItem value="high">High - Significant impact</MenuItem>
              <MenuItem value="critical">Critical - Service unavailable</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the incident, what happened, and any initial findings..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateIncident} variant="contained">Report Incident</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Incident Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFormData.status}
              label="Status"
              onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value })}
            >
              <MenuItem value="investigating">Investigating</MenuItem>
              <MenuItem value="identified">Identified</MenuItem>
              <MenuItem value="monitoring">Monitoring</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Update Message (Optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={statusFormData.update_message}
            onChange={(e) => setStatusFormData({ ...statusFormData, update_message: e.target.value })}
            placeholder="Provide an update on the incident status..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained">Update Status</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Incident Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Incident</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Incident Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Impact Level</InputLabel>
            <Select
              value={formData.impact}
              label="Impact Level"
              onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateIncident} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Incident Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Incident</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedIncident?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteIncident} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default IncidentManagement;
