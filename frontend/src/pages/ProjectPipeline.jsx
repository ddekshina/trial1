import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { DragIndicator, Edit, Save, Close } from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:5000';

const stages = [
  'Pricing Submissions',
  'Quote Generated',
  'Contract Signed',
  'Contract Rejected',
  'Project Started',
  'Project Delivered',
  'Project Change Log After Delivery',
  'Change Log Pricing Accepted',
  'Change Log Pricing Rejected'
];

const formatDeliverables = (deliverables) => {
  if (!deliverables || !Array.isArray(deliverables)) return [];
  
  return deliverables.map((deliverable, index) => ({
    id: index,
    type: deliverable.type || 'Not specified',
    quantity: deliverable.quantity || 'N/A',
    widgets: deliverable.widgets || 'N/A'
  }));
};

const ProjectPipeline = () => {
  const [pipelineItems, setPipelineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);

  useEffect(() => {
    fetchPipelineItems();
  }, []);

  const fetchPipelineItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/pipeline`);
      setPipelineItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pipeline items:', error);
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const itemId = parseInt(result.draggableId);
    const newStage = stages[result.destination.droppableId];
    
    try {
      await axios.put(`${API_BASE_URL}/api/pipeline/${itemId}`, {
        current_stage: newStage
      });
      
      setPipelineItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, current_stage: newStage } : item
        )
      );
    } catch (error) {
      console.error('Error updating pipeline item:', error);
    }
  };

  const handleEditNote = (item) => {
    setEditingNote(item.id);
    setNoteText(item.notes || '');
  };

  const handleSaveNote = async (itemId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/pipeline/${itemId}`, {
        notes: noteText
      });
      
      setPipelineItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, notes: noteText } : item
        )
      );
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleOpenDetails = (item) => {
    setSelectedItem(item);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedItem(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Project Pipeline
      </Typography>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 2 }}>
          {stages.map((stage, stageIndex) => (
            <Droppable key={stageIndex} droppableId={`${stageIndex}`}>
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minWidth: 300,
                    bgcolor: 'grey.100',
                    p: 2,
                    borderRadius: 1
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {stage}
                  </Typography>
                  
                  {pipelineItems
                    .filter(item => item.current_stage === stage)
                    .map((item, index) => (
                      <Draggable key={item.id} draggableId={`${item.id}`} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{ mb: 2, cursor: 'pointer' }}
                            onClick={() => handleOpenDetails(item)}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box {...provided.dragHandleProps}>
                                  <DragIndicator />
                                </Box>
                                <Box sx={{ ml: 1, flexGrow: 1 }}>
                                  <Typography variant="subtitle1">
                                    {item.form_data?.client_name || 'No client name'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {item.form_data?.project_title || 'No project title'}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    Created: {new Date(item.created_at).toLocaleDateString()}
                                  </Typography>
                                  
                                  {editingNote === item.id ? (
                                    <Box sx={{ mt: 1 }}>
                                      <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                      />
                                      <Button
                                        size="small"
                                        startIcon={<Save />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSaveNote(item.id);
                                        }}
                                        sx={{ mt: 1 }}
                                      >
                                        Save
                                      </Button>
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                      {item.notes || 'No notes'}
                                      <Button
                                        size="small"
                                        startIcon={<Edit />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditNote(item);
                                        }}
                                        sx={{ ml: 1 }}
                                      >
                                        Edit
                                      </Button>
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          ))}
        </Box>
      </DragDropContext>

      {/* Enhanced Details Dialog */}
      <Dialog
        open={openDetails}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedItem?.form_data?.project_title || 'Project Details'}
            </Typography>
            <Button onClick={handleCloseDetails} startIcon={<Close />}>
              Close
            </Button>
          </Box>
          <Chip 
            label={selectedItem?.current_stage} 
            color="primary" 
            size="small" 
            sx={{ mt: 1 }}
          />
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedItem && (
            <>
              {/* Basic Information Section */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                Basic Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Pricing Analyst" 
                    secondary={selectedItem.form_data?.pricing_analyst_name || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Client Name" 
                    secondary={selectedItem.form_data?.client_name || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Client Type" 
                    secondary={selectedItem.form_data?.client_type || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Industry Sector" 
                    secondary={selectedItem.form_data?.industry_sector || 'Not specified'} 
                  />
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />

              {/* Project Details Section */}
              <Typography variant="subtitle1" gutterBottom>
                Project Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Project Title" 
                    secondary={selectedItem.form_data?.project_title || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Project Description" 
                    secondary={selectedItem.form_data?.project_description || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Business Objective" 
                    secondary={selectedItem.form_data?.business_objective || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Subscription Plan" 
                    secondary={selectedItem.form_data?.subscription_plan || 'Not specified'} 
                  />
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />

              {/* Expected Deliverables Section */}
              <Typography variant="subtitle1" gutterBottom>
                Expected Deliverables
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Widgets</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formatDeliverables(selectedItem.form_data?.expected_deliverables).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell component="th" scope="row">
                          {row.type}
                        </TableCell>
                        <TableCell align="right">{row.quantity}</TableCell>
                        <TableCell align="right">{row.widgets}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ my: 2 }} />

              {/* Data Sources Section */}
              <Typography variant="subtitle1" gutterBottom>
                Data Sources
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Data Sources" 
                    secondary={
                      selectedItem.form_data?.data_sources 
                        ? selectedItem.form_data.data_sources.join(', ') 
                        : 'Not specified'
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Databases" 
                    secondary={
                      selectedItem.form_data?.databases 
                        ? selectedItem.form_data.databases.join(', ') 
                        : 'Not specified'
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Volume of Data" 
                    secondary={selectedItem.form_data?.volume_of_data || 'Not specified'} 
                  />
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />

              {/* Technical Details Section */}
              <Typography variant="subtitle1" gutterBottom>
                Technical Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Required Integrations" 
                    secondary={
                      selectedItem.form_data?.required_integrations 
                        ? selectedItem.form_data.required_integrations.join(', ') 
                        : 'Not specified'
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Interactivity Needed" 
                    secondary={
                      selectedItem.form_data?.interactivity_needed 
                        ? selectedItem.form_data.interactivity_needed.join(', ') 
                        : 'Not specified'
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="User Access Levels" 
                    secondary={
                      selectedItem.form_data?.user_access_levels 
                        ? selectedItem.form_data.user_access_levels.join(', ') 
                        : 'Not specified'
                    } 
                  />
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />

              {/* Pricing Information Section */}
              <Typography variant="subtitle1" gutterBottom>
                Pricing Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Engagement Type" 
                    secondary={selectedItem.form_data?.engagement_type || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Support Plan" 
                    secondary={selectedItem.form_data?.support_plan_required || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Budget Range" 
                    secondary={
                      selectedItem.form_data?.budget_range 
                        ? `$${selectedItem.form_data.budget_range}` 
                        : 'Not specified'
                    } 
                  />
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />

              {/* Notes Section */}
              <Typography variant="subtitle1" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                {selectedItem.notes || 'No notes available'}
              </Typography>
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectPipeline;