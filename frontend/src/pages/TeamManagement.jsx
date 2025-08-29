import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const TeamManagement = () => {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [roleDialog, setRoleDialog] = useState(false);
  const [revokeDialog, setRevokeDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [pendingAction, setPendingAction] = useState(''); // 'approve' or 'reject'

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/team/members');
      setTeamData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async () => {
    try {
      const payload = {
        user_id: selectedUser.id,
        action: pendingAction,
        role: pendingAction === 'approve' ? selectedRole || 'viewer' : undefined
      };

      const response = await api.post('/team/approve-user', payload);
      
      if (response.data.success) {
        setSuccess(response.data.message);
        fetchTeamMembers();
        setActionDialog(false);
        setSelectedUser(null);
        setSelectedRole('');
        setPendingAction('');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${pendingAction} user`);
    }
  };

  const handleRoleUpdate = async () => {
    try {
      const payload = {
        user_id: selectedUser.id,
        new_role: selectedRole
      };

      const response = await api.put('/team/update-role', payload);
      
      if (response.data.success) {
        setSuccess(response.data.message);
        fetchTeamMembers();
        setRoleDialog(false);
        setSelectedUser(null);
        setSelectedRole('');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update role');
    }
  };

  const revokeAccess = async (member) => {
    setSelectedUser(member);
    setRevokeDialog(true);
  };

  const confirmRevokeAccess = async () => {
    try {
      const response = await api.delete(`/team/revoke-access?user_id=${selectedUser.id}`);
      
      if (response.data.success) {
        setSuccess(response.data.message);
        fetchTeamMembers();
        setRevokeDialog(false);
        setSelectedUser(null);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to revoke access');
    }
  };

  const restoreAccess = async (member) => {
    setSelectedUser(member);
    setSelectedRole('viewer'); // Default role for restoration
    setRestoreDialog(true);
  };

  const confirmRestoreAccess = async () => {
    try {
      const payload = {
        user_id: selectedUser.id,
        action: 'restore',
        role: selectedRole || 'viewer'
      };

      const response = await api.post('/team/restore-access', payload);
      
      if (response.data.success) {
        setSuccess(response.data.message);
        fetchTeamMembers();
        setRestoreDialog(false);
        setSelectedUser(null);
        setSelectedRole('');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to restore access');
    }
  };

  const openApprovalDialog = (member, action) => {
    setSelectedUser(member);
    setPendingAction(action);
    if (action === 'approve') {
      setSelectedRole('viewer'); // Default role
    } else {
      setSelectedRole(''); // No role needed for rejection
    }
    setActionDialog(true);
  };

  const openRoleDialog = (member) => {
    setSelectedUser(member);
    setSelectedRole(member.role);
    setRoleDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'editor': return 'info';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!teamData) {
    return (
      <Box p={3}>
        <Alert severity="error">Failed to load team data</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Team Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Team Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Members
              </Typography>
              <Typography variant="h4">
                {teamData.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                Pending Approval
              </Typography>
              <Typography variant="h4">
                {teamData.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                Approved
              </Typography>
              <Typography variant="h4">
                {teamData.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                Rejected
              </Typography>
              <Typography variant="h4">
                {teamData.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Team Members Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamData.members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    {member.first_name} {member.last_name}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={member.role.toUpperCase()}
                      color={getRoleColor(member.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.status.toUpperCase()}
                      color={getStatusColor(member.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {member.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => openApprovalDialog(member, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => openApprovalDialog(member, 'reject')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {member.status === 'approved' && member.id !== user?.id && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openRoleDialog(member)}
                          >
                            Change Role
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => revokeAccess(member)}
                            sx={{ ml: 1 }}
                          >
                            Revoke Access
                          </Button>
                        </>
                      )}
                      {member.status === 'rejected' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => restoreAccess(member)}
                        >
                          Restore Access
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Approval Dialog */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)}>
        <DialogTitle>
          {pendingAction === 'approve' ? 'Approve User' : 'Reject User'}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography gutterBottom>
                {selectedUser.first_name} {selectedUser.last_name} ({selectedUser.email})
              </Typography>
              
              {pendingAction === 'approve' && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    label="Role"
                  >
                    <MenuItem value="viewer">Viewer</MenuItem>
                    <MenuItem value="editor">Editor</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              )}
              
              {pendingAction === 'reject' && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  This user will be rejected and will not be able to access the organization.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleApproveReject}
            variant="contained"
            color={pendingAction === 'approve' ? 'success' : 'error'}
          >
            {pendingAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Update Dialog */}
      <Dialog open={roleDialog} onClose={() => setRoleDialog(false)}>
        <DialogTitle>Update User Role</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography gutterBottom>
                {selectedUser.first_name} {selectedUser.last_name} ({selectedUser.email})
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>New Role</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  label="New Role"
                >
                  <MenuItem value="viewer">Viewer</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              
              {selectedUser.id === user?.id ? (
                <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                  Note: You cannot change your own role.
                </Typography>
              ) : (
                <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                  You can change this user's role or revoke their access entirely.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRoleUpdate}
            variant="contained"
            color="primary"
            disabled={selectedUser?.id === user?.id}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Access Confirmation Dialog */}
      <Dialog open={revokeDialog} onClose={() => setRevokeDialog(false)}>
        <DialogTitle>Revoke User Access</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography gutterBottom>
                Are you sure you want to revoke access for:
              </Typography>
              <Typography variant="h6" gutterBottom>
                {selectedUser.first_name} {selectedUser.last_name} ({selectedUser.email})
              </Typography>
              <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
                ⚠️ This action will immediately block this user from accessing the organization. 
                The user's status will be set to "Rejected" and they will need to be re-approved by an admin to regain access.
              </Typography>
              {selectedUser.role === 'admin' && (
                <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                  🔐 This user is an admin. Revoking access will remove their administrative privileges.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeDialog(false)}>Cancel</Button>
          <Button
            onClick={confirmRevokeAccess}
            variant="contained"
            color="error"
          >
            Revoke Access
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Access Dialog */}
      <Dialog open={restoreDialog} onClose={() => setRestoreDialog(false)}>
        <DialogTitle>Restore User Access</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography gutterBottom>
                Restore access for:
              </Typography>
              <Typography variant="h6" gutterBottom>
                {selectedUser.first_name} {selectedUser.last_name} ({selectedUser.email})
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="viewer">Viewer</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              
              <Typography variant="body2" color="info.main" sx={{ mt: 2 }}>
                ✅ This will restore the user's access to the organization with the selected role.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialog(false)}>Cancel</Button>
          <Button
            onClick={confirmRestoreAccess}
            variant="contained"
            color="success"
          >
            Restore Access
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamManagement;
