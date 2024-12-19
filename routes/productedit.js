var express = require('express');
var router = express.Router();
const products = require('../module/products');

router.get('/:productID/verify', async (req, res) => {
  try {
    const productID = req.params.productID;
    const product = await products.findById(productID);

    if (product) {
      res.json({ productID: product._id }); // 返回产品 ID
    } else {
      res.json({ error: 'Product not found' }); // 如果产品不存在
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.json({ error: 'Server error' });
  }
});

// password verify
router.post('/:productID/verify', async (req, res, next) => {
  try {
    const productID = req.params.productID;
    const { password } = req.body;

    // find product and verify password
    const product = await products.findById(productID);

    if (product && product.password === password) {
      // password match
      res.status(200).json({ message: 'Password verified successfully' });
    } else {
      // Password doesn't match
      res.status(401).json({ error: 'Incorrect password' });
    }
  } catch (error) {
    next(error);
  }
});


// display the edit page
router.get('/:productID', async (req, res, next) => {
  try {
    const productID = req.params.productID;
    const product = await products.findById(productID); // Fetch product by ID

    if (product) {
      // Render edit page with product data
      res.json(product);
    } else {
      // Product not found, send 404 response
      res.status(404).json("Product does not exist");
    }
  } catch (error) {
    next(error); // Pass error to error-handling middleware
  }
});

// Route to handle updating the product
router.post('/:productID', async (req, res, next) => {
  try {
    const productID = req.params.productID;
    // if any delete action
    if (req.body.delete) {
      await products.findByIdAndDelete(productID);
      //back to the homw page, once the post is deleted
      return res.render('delete-success'); 
    }
    const { title, seller, contact, imageURL, description, condition, price, location, status } = req.body;
    const updatedStatus = status === 'Sold' ? 'Unavailable' : 'Available';

    // Update the product in the database with new data
    await products.findByIdAndUpdate(productID, {
      title,
      seller,
      contact,
      imageURL,
      description,
      condition,
      price,
      location,
      status: updatedStatus
    });

    // Redirect back to the product details page after update
    res.redirect(`/product/${productID}`);
  } catch (error) {
    next(error); // Pass any errors to the error-handling middleware
  }
});



module.exports = router;