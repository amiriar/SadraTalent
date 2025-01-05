import { Button, Card, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/chats');
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          AmirChat
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Connect with your friends and the world around you.
        </Typography>
      </Box>

      <Card
        sx={{
          p: 3,
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleClick}
          sx={{
            fontSize: '16px',
            px: 4,
            py: 1.5,
            borderRadius: 2,
          }}
        >
          Go to Chats
        </Button>
      </Card>
    </Container>
  );
}

export default App;
