import React, { useState, useEffect, useRef } from 'react';
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
  Tab,
  Tabs,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MailIcon from '@mui/icons-material/Mail';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from "sweetalert2";
import { serverURL, postData, getData } from './services/backendServices';

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
  const [selectedItem, setSelectedItem] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const coverInputRef = useRef();
  const additionalInputRef = useRef();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const result = await getData('item/fetch_items');
    if (result && result.status) {
      const fetchedItems = result.data.map((item) => ({
        ...item,
        coverImage: `${serverURL}/images/${item.image}`,
        additionalImages: item.additionalimage
          ? item.additionalimage.split(',').map(img => `${serverURL}/images/${img}`)
          : []
      }));
      setItems(fetchedItems);
    } else {
      console.error(result?.message || 'Fetch failed');
    }
  };

  const handleTabChange = (event, newValue) => setTab(newValue);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    
    if (type === 'cover') {
      const file = files[0];
      setFormData(prev => ({ ...prev, coverImage: file }));
      
      // Create preview for cover image
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setCoverImagePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setCoverImagePreview(null);
      }
    } else {
      setFormData(prev => ({ ...prev, additionalImages: files }));
      
      // Create previews for additional images
      const previewPromises = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(previewPromises).then(previews => {
        setAdditionalImagePreviews(previews);
      });
    }
  };

  const removeCoverImage = () => {
    setFormData(prev => ({ ...prev, coverImage: null }));
    setCoverImagePreview(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const removeAdditionalImage = (index) => {
    const newFiles = [...formData.additionalImages];
    newFiles.splice(index, 1);
    setFormData(prev => ({ ...prev, additionalImages: newFiles }));
    
    const newPreviews = [...additionalImagePreviews];
    newPreviews.splice(index, 1);
    setAdditionalImagePreviews(newPreviews);
    
    // Reset the input to reflect the change
    if (additionalInputRef.current) {
      const dt = new DataTransfer();
      newFiles.forEach(file => dt.items.add(file));
      additionalInputRef.current.files = dt.files;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', formData.name);
    form.append('type', formData.type);
    form.append('description', formData.description);
    if (formData.coverImage) form.append('image', formData.coverImage);
    formData.additionalImages.forEach((file) => {
      form.append('additionalimages', file);
    });

    const result = await postData('item/insert_items', form);

    if (result && result.status) {
      Swal.fire({
        icon: "success",
        title: "Product Registered",
        text: result.message,
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
      setFormData({ name: '', type: '', description: '', coverImage: null, additionalImages: [] });
      setCoverImagePreview(null);
      setAdditionalImagePreviews([]);
      if (coverInputRef.current) coverInputRef.current.value = '';
      if (additionalInputRef.current) additionalInputRef.current.value = '';
      fetchItems();
    } else {
      Swal.fire({ icon: 'error', title: 'Failed', text: result.message });
    }
  };

  const handleEnquire = (item) => {
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
          
          {/* Cover Image Section */}
          <Box my={2}>
            <Typography variant="subtitle1" gutterBottom>
              Cover Image *
            </Typography>
            <input
              accept="image/*"
              id="cover-image"
              type="file"
              ref={coverInputRef}
              onChange={(e) => handleFileChange(e, 'cover')}
              required
              style={{ marginBottom: '10px' }}
            />
            {coverImagePreview && (
              <Box mt={1} position="relative" display="inline-block">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                <IconButton
                  onClick={removeCoverImage}
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                  }}
                  size="small"
                >
                  <DeleteIcon color="error" />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Additional Images Section */}
          <Box my={2}>
            <Typography variant="subtitle1" gutterBottom>
              Additional Images (Optional)
            </Typography>
            <input
              accept="image/*"
              id="additional-images"
              type="file"
              multiple
              ref={additionalInputRef}
              onChange={(e) => handleFileChange(e, 'additional')}
              style={{ marginBottom: '10px' }}
            />
            {additionalImagePreviews.length > 0 && (
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                {additionalImagePreviews.map((preview, index) => (
                  <Box key={index} position="relative" display="inline-block">
                    <img
                      src={preview}
                      alt={`Additional preview ${index + 1}`}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <IconButton
                      onClick={() => removeAdditionalImage(index)}
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                      }}
                      size="small"
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
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