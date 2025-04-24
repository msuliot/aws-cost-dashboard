import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  Modal,
  IconButton,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { fetchCostData, CostData } from '../services/awsService';
import CloseIcon from '@mui/icons-material/Close';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        },
      },
    },
  },
});

const COLORS = [
  '#90caf9', '#f48fb1', '#a5d6a7', '#ffcc80', '#b39ddb',
  '#ef9a9a', '#80cbc4', '#ffab91', '#ce93d8', '#9fa8da'
];

interface ServiceDetailsModalProps {
  service: {
    name: string;
    cost: number;
    percentage: number;
    usageTypes: {
      name: string;
      cost: number;
    }[];
  } | null;
  onClose: () => void;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({ service, onClose }) => {
  if (!service) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Modal
      open={!!service}
      onClose={onClose}
      aria-labelledby="service-details-modal"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: 600,
        maxHeight: '80vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            {service.name} Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Typography variant="h4" color="primary" gutterBottom>
          {formatCurrency(service.cost)}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {service.percentage.toFixed(1)}% of total cost
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Usage Types
        </Typography>
        <Box sx={{ 
          overflowY: 'auto',
          flexGrow: 1,
          pr: 1, // Add some padding for the scrollbar
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            },
          },
        }}>
          <Grid container spacing={2}>
            {service.usageTypes.map((usage) => (
              <Grid item xs={12} key={usage.name}>
                <Card variant="outlined" sx={{ 
                  borderRadius: 2,
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                  }
                }}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {usage.name}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(usage.cost)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
};

const Dashboard: React.FC = () => {
  const [costData, setCostData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<CostData['services'][0] | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCostData();
        setCostData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch cost data. Please check your AWS credentials and try again.');
        console.error('Error fetching cost data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!costData) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Process service data to show only top 5 and group the rest as "Others"
  const processServiceData = () => {
    const sortedServices = [...costData.services].sort((a, b) => b.cost - a.cost);
    
    if (sortedServices.length <= 5) {
      return sortedServices.map(service => ({
        name: service.name,
        cost: service.cost,
        percentage: service.percentage
      }));
    }
    
    const top5 = sortedServices.slice(0, 5).map(service => ({
      name: service.name,
      cost: service.cost,
      percentage: service.percentage
    }));
    
    const others = sortedServices.slice(5);
    const othersCost = others.reduce((sum, service) => sum + service.cost, 0);
    const othersPercentage = others.reduce((sum, service) => sum + service.percentage, 0);
    
    return [
      ...top5,
      {
        name: 'Others',
        cost: othersCost,
        percentage: othersPercentage
      }
    ];
  };

  const serviceData = processServiceData();

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ 
        flexGrow: 1, 
        p: 3, 
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #121212 0%, #1a1a1a 100%)'
      }}>
        <Grid container spacing={3}>
          {/* Total Cost Card */}
          <Grid item xs={12}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              <CardContent>
                <Typography variant="h4" gutterBottom color="text.secondary">
                  Total AWS Cost
                </Typography>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 500 }}>
                  {formatCurrency(costData.totalCost)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Service Cost Distribution */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              height: '400px',
              background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              <Typography variant="h6" gutterBottom>
                Cost by Service
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    dataKey="cost"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '14px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    }}
                    labelStyle={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                    itemStyle={{
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Service Details */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              <Typography variant="h6" gutterBottom>
                Service Details
              </Typography>
              <Grid container spacing={2}>
                {costData.services.map((service) => (
                  <Grid item xs={12} sm={6} md={4} key={service.name}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                        }
                      }}
                      onClick={() => setSelectedService(service)}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {service.name}
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {formatCurrency(service.cost)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {service.percentage.toFixed(1)}% of total
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <ServiceDetailsModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard; 