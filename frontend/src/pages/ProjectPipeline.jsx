import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
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
  Paper,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Badge,
  Avatar,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import { 
  DragIndicator, 
  Edit, 
  Save, 
  Close, 
  NoteAdd, 
  Info, 
  Business, 
  Description, 
  Storage, 
  Code, 
  AttachMoney,
  CalendarToday,
  Person,
  Category,
  Work,
  Timeline,
  Settings,
  HelpOutline
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const API_BASE_URL = 'http://localhost:5000';

const stages = [
  'Pricing Submissions',
  'Quote Generated',
  'Contract Signed',
  'Contract Rejected',
  'Project Started',
  'Project Delivered',
  'Project Change Log',
  'Change Log Pricing Accepted',
  'Change Log Pricing Rejected'
];

const stageColors = {
  'Pricing Submissions': '#4e79a7',
  'Quote Generated': '#f28e2b',
  'Contract Signed': '#e15759',
  'Contract Rejected': '#76b7b2',
  'Project Started': '#59a14f',
  'Project Delivered': '#edc948',
  'Project Change Log': '#b07aa1',
  'Change Log Pricing Accepted': '#ff9da7',
  'Change Log Pricing Rejected': '#9c755f'
};

const StyledDroppable = styled(Box)(({ theme, isdraggingover }) => ({
  minWidth: 300,
  width: '100%',
  backgroundColor: isdraggingover === 'true' ? theme.palette.action.hover : theme.palette.grey[100],
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.2s ease',
  [theme.breakpoints.down('sm')]: {
    minWidth: 280,
    padding: theme.spacing(1)
  }
}));

const ProjectCard = styled(Card)(({ theme, stage }) => ({
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  borderLeft: `4px solid ${stageColors[stage] || theme.palette.primary.main}`,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

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
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    fetchPipelineItems();
  }, []);

  const fetchPipelineItems = async () => {
    try {
      setLoading(true);
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
  const oldStage = pipelineItems.find(item => item.id === itemId)?.current_stage;
  
  // Optimistically update the UI
  const updatedItems = pipelineItems.map(item => 
    item.id === itemId ? { ...item, current_stage: newStage } : item
  );
  setPipelineItems(updatedItems);

  try {
    // If moving to Quote Generated stage, ensure we have a quote
    if (newStage === 'Quote Generated' && oldStage !== 'Quote Generated') {
      const item = updatedItems.find(item => item.id === itemId);
      
      // If no quote exists, generate one
      if (!item.quote_amount && item.form_id) {
        try {
          const quoteResponse = await axios.post(
            `${API_BASE_URL}/api/forms/${item.form_id}/generate-quote`
          );
          console.log('Quote generated:', quoteResponse.data);
        } catch (quoteError) {
          console.error('Failed to generate quote:', quoteError);
          throw quoteError; // This will trigger the catch block below
        }
      }
    }
    
    // Update the stage in the backend
    await axios.put(`${API_BASE_URL}/api/pipeline/${itemId}`, {
      current_stage: newStage
    });
    
    // Refresh the pipeline items to ensure consistency
    await fetchPipelineItems();
    
  } catch (error) {
    console.error('Error updating pipeline item:', error.response?.data || error.message);
    // Revert to previous state
    setPipelineItems(pipelineItems);
    // Optionally show an error message to the user
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
    setActiveTab(0);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedItem(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredPipelineItems = pipelineItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.form_data?.client_name?.toLowerCase().includes(searchLower) ||
      item.form_data?.project_title?.toLowerCase().includes(searchLower) ||
      item.current_stage?.toLowerCase().includes(searchLower) ||
      item.notes?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading pipeline data...</Typography>
      </Box>
    );
  }

  const renderStageColumns = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: 2, 
        pb: 2,
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          height: '8px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.grey[400],
          borderRadius: '4px'
        }
      }}>
        {stages.map((stage, stageIndex) => {
          const stageItems = filteredPipelineItems.filter(item => item.current_stage === stage);
          return (
            <Droppable key={stageIndex} droppableId={`${stageIndex}`}>
              {(provided, snapshot) => (
                <StyledDroppable
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  isdraggingover={snapshot.isDraggingOver.toString()}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 'bold',
                      color: stageColors[stage],
                      flexGrow: 1
                    }}>
                      {stage}
                    </Typography>
                    <Badge 
                      badgeContent={stageItems.length} 
                      color="primary" 
                      sx={{ 
                        '& .MuiBadge-badge': { 
                          backgroundColor: stageColors[stage],
                          color: theme.palette.getContrastText(stageColors[stage])
                        } 
                      }} 
                    />
                  </Box>
                  
                  {stageItems.length === 0 && (
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      backgroundColor: theme.palette.action.hover,
                      borderRadius: 1,
                      mb: 2
                    }}>
                      <Typography variant="caption" color="textSecondary">
                        No projects in this stage
                      </Typography>
                    </Box>
                  )}
                  
                  {stageItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={`${item.id}`} index={index}>
                      {(provided) => (
                        <ProjectCard
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          stage={stage}
                          onClick={() => handleOpenDetails(item)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Box {...provided.dragHandleProps} sx={{ 
                                cursor: 'grab',
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%',
                                pr: 1
                              }}>
                                <DragIndicator color="action" />
                              </Box>
                              <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="subtitle1" noWrap>
                                    {item.form_data?.client_name || 'No client name'}
                                  </Typography>
                                  <Tooltip title={new Date(item.created_at).toLocaleDateString()}>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </Typography>
                                  </Tooltip>
                                </Box>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {item.form_data?.project_title || 'No project title'}
                                </Typography>
                                
                                {editingNote === item.id ? (
                                  <Box sx={{ mt: 1 }}>
                                    <TextField
                                      fullWidth
                                      multiline
                                      rows={2}
                                      value={noteText}
                                      onChange={(e) => setNoteText(e.target.value)}
                                      variant="outlined"
                                      size="small"
                                      autoFocus
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                      <Button
                                        size="small"
                                        startIcon={<Save />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSaveNote(item.id);
                                        }}
                                        variant="contained"
                                        color="primary"
                                        sx={{ mr: 1 }}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingNote(null);
                                        }}
                                        variant="outlined"
                                      >
                                        Cancel
                                      </Button>
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" sx={{ 
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}>
                                      {item.notes || 'No notes'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                      <Tooltip title="Edit notes">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditNote(item);
                                          }}
                                        >
                                          <Edit fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </ProjectCard>
                      )}
                    </Draggable>
                  ))}
                  
                  {provided.placeholder}
                </StyledDroppable>
              )}
            </Droppable>
          );
        })}
      </Box>
    </DragDropContext>
  );

  const renderDetailsDialog = () => (
    <Dialog
      open={openDetails}
      onClose={handleCloseDetails}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      scroll="paper"
    >
      <DialogTitle sx={{ 
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        py: 2
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" noWrap>
              {selectedItem?.form_data?.project_title || 'Project Details'}
            </Typography>
            <Typography variant="subtitle2" noWrap>
              {selectedItem?.form_data?.client_name}
            </Typography>
          </Box>
          <IconButton 
            edge="end" 
            onClick={handleCloseDetails} 
            sx={{ color: theme.palette.primary.contrastText }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {selectedItem && (
          <>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2
              }}>
                <Chip 
                  label={selectedItem?.current_stage} 
                  sx={{ 
                    backgroundColor: stageColors[selectedItem?.current_stage] || theme.palette.primary.main,
                    color: theme.palette.getContrastText(stageColors[selectedItem?.current_stage] || theme.palette.primary.main),
                    fontWeight: 'bold'
                  }} 
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {selectedItem.form_data?.pricing_analyst_name || 'Not specified'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {new Date(selectedItem.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant={isMobile ? "fullWidth" : "standard"}
                sx={{ mb: 2 }}
              >
                <Tab label="Overview" icon={<Info />} iconPosition="start" />
                <Tab label="Client" icon={<Business />} iconPosition="start" />
                <Tab label="Project" icon={<Description />} iconPosition="start" />
                <Tab label="Data" icon={<Storage />} iconPosition="start" />
                <Tab label="Technical" icon={<Code />} iconPosition="start" />
                <Tab label="Pricing" icon={<AttachMoney />} iconPosition="start" />
              </Tabs>
            </Box>
            
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <NoteAdd sx={{ mr: 1 }} /> Project Notes
                </Typography>
                {editingNote === selectedItem.id ? (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      variant="outlined"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleSaveNote(selectedItem.id)}
                        sx={{ mr: 2 }}
                      >
                        Save Notes
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditingNote(null)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="body1">
                      {selectedItem.notes || 'No notes available for this project.'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleEditNote(selectedItem)}
                      >
                        Edit Notes
                      </Button>
                    </Box>
                  </Paper>
                )}
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Work sx={{ mr: 1 }} /> Quick Facts
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Project Stage" 
                          secondary={
                            <Chip 
                              label={selectedItem.current_stage} 
                              size="small"
                              sx={{ 
                                backgroundColor: stageColors[selectedItem.current_stage],
                                color: theme.palette.getContrastText(stageColors[selectedItem.current_stage])
                              }}
                            />
                          } 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Engagement Type" 
                          secondary={selectedItem.form_data?.engagement_type || 'Not specified'} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Subscription Plan" 
                          secondary={selectedItem.form_data?.subscription_plan || 'Not specified'} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Timeline sx={{ mr: 1 }} /> Timeline
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Created" 
                          secondary={new Date(selectedItem.created_at).toLocaleDateString()} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Last Updated" 
                          secondary={new Date(selectedItem.updated_at).toLocaleDateString()} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Business sx={{ mr: 1 }} /> Client Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List dense>
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
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Pricing Analyst" 
                          secondary={selectedItem.form_data?.pricing_analyst_name || 'Not specified'} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Business Objective" 
                          secondary={selectedItem.form_data?.business_objective || 'Not specified'} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Description sx={{ mr: 1 }} /> Project Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
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
                    </List>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Category sx={{ mr: 1 }} /> Deliverables
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
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Storage sx={{ mr: 1 }} /> Data Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
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
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Volume of Data" 
                          secondary={selectedItem.form_data?.volume_of_data || 'Not specified'} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 4 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Code sx={{ mr: 1 }} /> Technical Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
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
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
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
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 5 && (
  <Box>
    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
      <AttachMoney sx={{ mr: 1 }} /> Pricing Information
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
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
          {selectedItem.quote_amount && (
            <ListItem>
              <ListItemText 
                primary="Quote Amount" 
                secondary={`$${selectedItem.quote_amount.toLocaleString()}`} 
              />
            </ListItem>
          )}
        </List>
      </Grid>
      <Grid item xs={12} md={6}>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="Budget Range" 
              secondary={
                selectedItem.form_data?.budget_range 
                  ? `$${selectedItem.form_data.budget_range.toLocaleString()}` 
                  : 'Not specified'
              } 
            />
          </ListItem>
        </List>
      </Grid>
    </Grid>
    
    {/* Quote breakdown section */}
    {selectedItem.quote_details && (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Quote Breakdown
        </Typography>
        <TableContainer component={Paper}>
          {/* Table with quote details */}
        </TableContainer>
        
        {/* PDF download button */}
        {selectedItem.form_data?.quote_pdf_url && (
          <Button
            variant="contained"
            onClick={() => window.open(`${API_BASE_URL}${selectedItem.form_data.quote_pdf_url}`, '_blank')}
          >
            Download Quote PDF
          </Button>
        )}
      </Box>
    )}
  </Box>
)}
            
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleCloseDetails} 
          variant="contained"
          color="primary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: 3,
        gap: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Project Pipeline
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          width: isMobile ? '100%' : 'auto'
        }}>
          <TextField
            size="small"
            placeholder="Search projects..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              width: isMobile ? '100%' : 300,
              backgroundColor: 'background.paper'
            }}
            InputProps={{
              startAdornment: (
                <HelpOutline color="action" sx={{ mr: 1 }} />
              )
            }}
          />
            <Button 
                variant="contained" 
                color="primary"
                sx={{ whiteSpace: 'nowrap' }}
                onClick={() => navigate('/')} // Redirect to root URL
                >
                New Project
            </Button>
        </Box>
      </Box>
      
      {renderStageColumns()}
      {renderDetailsDialog()}
    </Box>
  );
};

export default ProjectPipeline;