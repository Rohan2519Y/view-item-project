import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MailIcon from '@mui/icons-material/Mail';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Swal from "sweetalert2"

const itemTypes = ['Shirt', 'Pant', 'Shoes', 'Sports Gear', 'Accessories', 'Other'];

const App = () => {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    coverImage: null,
    additionalImages: []
  });
  const [success, setSuccess] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    // Load default items
    setItems([
      {
        id: 1,
        name: 'Sample T-Shirt',
        type: 'Shirt',
        description: 'A stylish cotton t-shirt',
        coverImage: 'https://via.placeholder.com/300x180?text=T-Shirt',
        additionalImages: ['https://via.placeholder.com/300x200?text=Back']
      }
    ]);
  }, []);

  const handleTabChange = (event, newValue) => setTab(newValue);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === 'cover') setFormData({ ...formData, coverImage: files[0] });
    else setFormData({ ...formData, additionalImages: files });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newItem = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      description: formData.description,
      coverImage: formData.coverImage ? URL.createObjectURL(formData.coverImage) : '',
      additionalImages: formData.additionalImages.map(file => URL.createObjectURL(file))
    };

    setItems(prev => [...prev, newItem]);
    setFormData({ name: '', type: '', description: '', coverImage: null, additionalImages: [] });
    setSuccess(true);

    if (newItem) {
      Swal.fire({
        icon: "success",
        title: "Product Register",
        text: 'Record Submitted Successfully',
        toast: true
      });
    }
    // Reset file inputs
    document.getElementById('cover-image').value = '';
    document.getElementById('additional-images').value = '';
  };

  const handleEnquire = async (item) => {
    const subject = `Inquiry about ${item.name}`;
    const body = `Hi, I'm interested in the item: ${item.name} (${item.type}).\n\n${item.description}`;
    const mailto = `mailto:info@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <Box>
      <AppBar position="static">
        <Tabs value={tab} onChange={handleTabChange} indicatorColor="secondary" textColor="inherit" centered>
          <Tab label="View Items" />
          <Tab label="Add Item" />
        </Tabs>
      </AppBar>

      {tab === 0 && (
        <Box p={3}>
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card onClick={() => setSelectedItem(item)} sx={{ cursor: 'pointer' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={item.coverImage || 'https://via.placeholder.com/300x180'}
                    alt={item.name}
                  />
                  <CardContent>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.type}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box component="form" p={3} onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="name"
            label="Item Name"
            value={formData.name}
            onChange={handleInputChange}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Item Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              {itemTypes.map((type) => (
                <MenuItem value={type} key={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            name="description"
            label="Item Description"
            value={formData.description}
            onChange={handleInputChange}
            margin="normal"
            required
          />
          <Box my={2}>
            <input
              accept="image/*"
              id="cover-image"
              type="file"
              onChange={(e) => handleFileChange(e, 'cover')}
              required
            />
          </Box>
          <Box my={2}>
            <input
              accept="image/*"
              id="additional-images"
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, 'additional')}
            />
          </Box>
          <Button variant="contained" color="primary" type="submit">
            Add Item
          </Button>
        </Box>
      )}

      <Dialog open={!!selectedItem} onClose={() => setSelectedItem(null)} maxWidth="md" fullWidth>
        {selectedItem && (
          <>
            <DialogTitle>
              {selectedItem.name}
              <IconButton onClick={() => setSelectedItem(null)} sx={{ float: 'right' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box textAlign="center">
                <img
                  src={selectedItem.coverImage}
                  alt={selectedItem.name}
                  style={{ maxHeight: 300, width: '100%', objectFit: 'contain' }}
                />
                {selectedItem.additionalImages.length > 0 && (
                  <Box mt={2}>
                    <img
                      src={selectedItem.additionalImages[carouselIndex]}
                      alt="additional"
                      style={{ maxHeight: 200 }}
                    />
                    <Box mt={1} display="flex" justifyContent="center" gap={2}>
                      <IconButton onClick={() => setCarouselIndex((carouselIndex - 1 + selectedItem.additionalImages.length) % selectedItem.additionalImages.length)}>
                        <ChevronLeftIcon />
                      </IconButton>
                      <IconButton onClick={() => setCarouselIndex((carouselIndex + 1) % selectedItem.additionalImages.length)}>
                        <ChevronRightIcon />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
              <Typography variant="body1" mt={2}>{selectedItem.description}</Typography>
              <Typography variant="subtitle2">Type: {selectedItem.type}</Typography>
            </DialogContent>
            <DialogActions>
              <Button startIcon={<MailIcon />} onClick={() => handleEnquire(selectedItem)} color="secondary">
                Enquire
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default App;