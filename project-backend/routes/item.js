var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool');

router.post('/insert_items', upload.fields([
  { name: 'image', maxCount: 1 },              
  { name: 'additionalimages', maxCount: 10 }   
]), function (req, res, next) {
  try {
    const coverImage = req.files['image'] ? req.files['image'][0].filename : '';
    const additionalImages = req.files['additionalimages']?.map(file => file.filename).join(',');

    pool.query(
      "INSERT INTO item (name, type, description, image, additionalimage) VALUES (?, ?, ?, ?, ?)",
      [
        req.body.name,
        req.body.type,
        req.body.description,
        coverImage,
        additionalImages
      ],
      function (error, result) {
        if (error) {
          console.error(error);
          
          res.status(500).json({ status: false, message: 'Database Error, Please Contact Backend Team' });
        } else {
      
          res.status(201).json({ status: true, message: 'Item Successfully Submitted' });
        }
      }
    );
  } catch (e) {
    console.error(e);
  
    res.status(500).json({ status: false, message: 'Critical Error, Please Contact Server Administrator' });
  }
});


router.get('/fetch_items', function (req, res, next) {
  try {
    pool.query('SELECT * FROM item', function (error, result) {
      if (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Database Error, Please Contact Backend Team' });
      } else {
        res.status(200).json({ status: true, message: 'Success', data: result });
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: false, message: 'Critical Error, Please Contact Server Administrator' });
  }
});

module.exports = router;