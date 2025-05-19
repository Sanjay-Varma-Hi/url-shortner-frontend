import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://url-shortner-bchm.onrender.com';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleShortUrl = async () => {
      // Get the path without the leading slash
      const shortCode = location.pathname.substring(1);
      
      // If we're at the root path, don't do anything
      if (!shortCode) return;

      try {
        const response = await axios.get(`${API_URL}/${shortCode}`);
        // Redirect to the original URL
        window.location.href = response.data.url;
      } catch (err) {
        setError('Invalid or expired URL');
        // Redirect back to home after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    };

    handleShortUrl();
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_URL}/shorten`, {
        original_url: url,
      });
      setShortUrl(`${window.location.origin}/${response.data.short_url}`);
      setSuccess('URL shortened successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setSuccess('Copied to clipboard!');
  };

  // If we're processing a short URL, show loading state
  if (location.pathname !== '/') {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>
            Redirecting to your destination...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            align="center"
            sx={{ mb: 4, fontWeight: 'bold' }}
          >
            URL Shortener
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Enter your URL"
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Shorten URL'}
            </Button>
          </form>

          {shortUrl && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Your shortened URL:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  backgroundColor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    wordBreak: 'break-all',
                  }}
                >
                  {shortUrl}
                </Typography>
                <Button
                  startIcon={<ContentCopyIcon />}
                  onClick={copyToClipboard}
                  variant="outlined"
                  size="small"
                >
                  Copy
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => {
          setError('');
          setSuccess('');
        }}
      >
        <Alert
          onClose={() => {
            setError('');
            setSuccess('');
          }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
