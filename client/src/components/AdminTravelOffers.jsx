import React, { useState, useEffect } from 'react';
import { TAGS } from '../constants/tags';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Stack,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Euro as EuroIcon,
  Hotel as HotelIcon
} from '@mui/icons-material';
import api from '../services/api';

const AdminTravelOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    country: '',
    city: '',
    category: '',
    images: [],
    pricePerPerson: '',
    minPersons: 1,
    maxPersons: 10,
    stars: 3,
    tags: []
  });

  const categories = ['Hotel', 'Apartment', 'Resort', 'Hostel', 'Ferienwohnung', 'Pension', 'Villa'];

  const [newImage, setNewImage] = useState('');
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/travel-offers');
      setOffers(response.data.offers || response.data);
      setError('');
    } catch (err) {
      console.error('Fehler beim Laden der Angebote:', err);
      setError('Fehler beim Laden der Reiseangebote');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      // Extrahiere nur die URLs aus den image objects
      const imageUrls = offer.images?.map(img => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object' && img.url) return img.url;
        return null;
      }).filter(url => url !== null) || [];
      
      setFormData({
        title: offer.title || '',
        description: offer.description || '',
        destination: offer.destination || '',
        country: offer.country || '',
        city: offer.city || '',
        category: offer.category || '',
        images: imageUrls,
        pricePerPerson: offer.pricePerPerson || '',
        minPersons: offer.minPersons || 1,
        maxPersons: offer.maxPersons || 10,
        stars: offer.stars || 3,
        tags: offer.tags || []
      });
    } else {
      setEditingOffer(null);
      setFormData({
        title: '',
        description: '',
        destination: '',
        country: '',
        city: '',
        category: '',
        images: [],
        pricePerPerson: '',
        minPersons: 1,
        maxPersons: 10,
        stars: 3,
        tags: []
      });
    }
    setNewImage('');
    setImageError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOffer(null);
    setNewImage('');
    setImageError('');
    setError('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddImage = () => {
    if (newImage.trim()) {
      // Validiere URL
      try {
        new URL(newImage.trim());
        setFormData(prev => ({ ...prev, images: [...prev.images, newImage.trim()] }));
        setNewImage('');
        setImageError('');
      } catch (err) {
        setImageError('Bitte geben Sie eine gültige URL ein');
      }
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setError('');

      if (!formData.title || !formData.description || !formData.destination || !formData.country || !formData.category || !formData.pricePerPerson) {
        setError('Bitte füllen Sie alle Pflichtfelder aus');
        return;
      }

      const submitData = {
        ...formData,
        pricePerPerson: Number(formData.pricePerPerson),
        minPersons: Number(formData.minPersons),
        maxPersons: Number(formData.maxPersons),
        stars: Number(formData.stars),
        images: formData.images
      };

      console.log('📤 Submitting data:', submitData);
      console.log('🔗 API endpoint:', editingOffer ? `/travel-offers/${editingOffer._id}` : '/travel-offers');

      if (editingOffer) {
        const response = await api.put(`/travel-offers/${editingOffer._id}`, submitData);
        console.log('✅ Update response:', response);
      } else {
        const response = await api.post('/travel-offers', submitData);
        console.log('✅ Create response:', response);
      }

      await loadOffers();
      handleCloseDialog();
    } catch (err) {
      console.error('❌ Fehler beim Speichern:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status
      });
      
      // Detaillierte Fehlermeldung
      let errorMessage = 'Fehler beim Speichern des Angebots';
      
      if (err.response?.status === 500) {
        if (err.response?.data?.error?.includes('is not a valid enum value')) {
          errorMessage = 'Ungültige Tag-Auswahl. Bitte verwenden Sie nur die vorgegebenen Tags.';
        } else {
          errorMessage = 'Serverfehler - Bitte überprüfen Sie Ihre Eingaben';
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sind Sie sicher, dass Sie dieses Angebot löschen möchten?')) {
      try {
        await api.delete(`/travel-offers/${id}`);
        await loadOffers();
      } catch (err) {
        console.error('Fehler beim Löschen:', err);
        setError('Fehler beim Löschen des Angebots');
      }
    }
  };

  return (
    <>
      <Box className="page-header">
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Reiseangebote verwalten
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Erstellen und bearbeiten Sie Hotels oder Apartments
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: '100%', mb: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titel</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Kategorie</TableCell>
                  <TableCell>Preis</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer._id}>
                    <TableCell>{offer.title}</TableCell>
                    <TableCell>{offer.destination}</TableCell>
                    <TableCell>{offer.category}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EuroIcon sx={{ mr: 1, fontSize: 16 }} />
                        {offer.pricePerPerson}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(offer)} color="primary" size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(offer._id)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {offers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" color="text.secondary">
                        Noch keine Angebote vorhanden
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Fab color="primary" onClick={() => handleOpenDialog()} sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <AddIcon />
        </Fab>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingOffer ? 'Angebot bearbeiten' : 'Neues Angebot erstellen'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Titel" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Destination" value={formData.destination} onChange={(e) => handleInputChange('destination', e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Land" value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Stadt" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kategorie *</InputLabel>
                <Select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} label="Kategorie" required>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Preis pro Person (€)" type="number" value={formData.pricePerPerson} onChange={(e) => handleInputChange('pricePerPerson', e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Min. Personen" type="number" value={formData.minPersons} onChange={(e) => handleInputChange('minPersons', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Max. Personen" type="number" value={formData.maxPersons} onChange={(e) => handleInputChange('maxPersons', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Sterne" type="number" value={formData.stars} onChange={(e) => handleInputChange('stars', e.target.value)} inputProps={{ min: 1, max: 5 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Beschreibung" multiline rows={3} value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} required />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tags</InputLabel>
                <Select multiple value={formData.tags} onChange={(e) => handleInputChange('tags', e.target.value)} input={<OutlinedInput label="Tags" />} renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}>
                  {TAGS.map(tag => (
                    <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Bilder</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField 
                  fullWidth 
                  label="Bild-URL hinzufügen" 
                  value={newImage} 
                  onChange={(e) => setNewImage(e.target.value)} 
                  placeholder="https://example.com/image.jpg" 
                  error={!!imageError}
                  helperText={imageError}
                />
                <Button onClick={handleAddImage} variant="outlined">Hinzufügen</Button>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.images.map((img, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <img 
                      src={img} 
                      alt={`Bild ${index + 1}`}
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXNpemU9IjE0Ij5CaWxkIGZlaGx0PC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: 'error.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'error.dark'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {formData.images.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Noch keine Bilder hinzugefügt
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingOffer ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminTravelOffers;