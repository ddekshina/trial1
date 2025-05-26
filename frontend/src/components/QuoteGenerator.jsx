import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { Email, Facebook, Download } from '@mui/icons-material';
import { EmailShareButton, FacebookShareButton } from "react-share";

const QuoteGenerator = ({ formData }) => {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const transformFormDataForCalculation = (data) => {
    return {
      num_dashboards: data.expectedDeliverables?.length || 0,
      num_widgets: data.numberOfWidgets || 0,
      data_sources: data.dataSources || [],
      database_tables: data.databases?.map(db => ({
        records: db.records || 0
      })) || [],
      num_apis: data.numberOfIntegrations || 0,
      features: data.interactivityNeeded || [],
      include_logo: data.customizationNeeds?.includes('logo') || false,
      custom_colors: data.customizationNeeds?.includes('colors') || false,
      custom_fonts: data.customizationNeeds?.includes('fonts') || false,
      support_plan: data.supportPlanRequired || 'basic',
      support_hours: data.supportPlanRequired === 'priority' ? 10 : 0,
      support_months: data.supportPlanRequired === 'dedicated' ? 1 : 0,
      client_name: data.clientName || '',
      project_title: data.projectTitle || '',
      id: data.id
    };
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (formData?.id) {
        // Use form ID endpoint if available
        response = await axios.post(
          `${import.meta.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/forms/${formData.id}/generate-quote`,
          {},
          { headers: { 'Content-Type': 'application/json' } }
        );
        setPdfUrl(`${import.meta.env.REACT_APP_API_URL || 'http://localhost:5000'}${response.data.pdf_url}`);
      } else {
        // Fall back to direct calculation endpoint
        const calculationData = transformFormDataForCalculation(formData);
        response = await axios.post(
          `${import.meta.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/generate-quote`,
          calculationData
        );
        setPdfUrl(response.data.pdf_url);
      }
      
      setBreakdown(response.data);
      
    } catch (err) {
      console.error("Quote calculation error:", err);
      setError(err.response?.data?.message || err.message || "Failed to calculate quote");
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate when component mounts if form data exists
  useEffect(() => {
    if (formData && !breakdown && !loading) {
      handleCalculate();
    }
  }, [formData]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Project Quote
      </Typography>

      {!breakdown && !loading && (
        <Button 
          variant="contained" 
          onClick={handleCalculate}
          disabled={!formData}
          sx={{ mb: 3 }}
        >
          Calculate Quote
        </Button>
      )}

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CircularProgress size={24} />
          <Typography>Calculating your quote...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {breakdown && (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cost Component</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(breakdown.breakdown || {}).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                    <TableCell align="right">${value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 'bold' } }}>
                  <TableCell>Total</TableCell>
                  <TableCell align="right">${breakdown.total?.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {pdfUrl && (
              <>
                <Button 
                  variant="contained"
                  href={pdfUrl}
                  download={`quote_${formData?.clientName || formData?.projectTitle || 'project'}.pdf`}
                  startIcon={<Download />}
                >
                  Download PDF
                </Button>

                <EmailShareButton
                  url={pdfUrl}
                  subject={`Quote for ${formData?.projectTitle || 'your project'}`}
                  body="Here's the quote for your project:"
                >
                  <Button 
                    variant="outlined"
                    startIcon={<Email />}
                  >
                    Email Quote
                  </Button>
                </EmailShareButton>

                <FacebookShareButton
                  url={pdfUrl}
                  quote={`Check out this quote for ${formData?.projectTitle || 'a project'}`}
                >
                  <Button 
                    variant="outlined"
                    startIcon={<Facebook />}
                  >
                    Share on Facebook
                  </Button>
                </FacebookShareButton>
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default QuoteGenerator;