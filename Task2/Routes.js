const product = require('./Product');
const CRUD = require('./CRUD');
const express = require('express');
const router = express.Router();
const productFields = ['title', 'price', 'description', 'category', 'image', 'rating'];

function getProductUpdates(body) {
    return productFields.reduce((updates, field) => {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            updates[field] = body[field];
        }
        return updates;
    }, {});
}


router.get('/products', (req, res) => {
    const products = CRUD.readProductsFromFile();
    res.status(200).json(products);
});

router.get('/products/:id', (req, res) => {
    const product = CRUD.readProductById(req.params.id);
    if (product) {
        res.status(200).json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

router.post('/products', (req, res) => {
    const { id, title, price, description, category, image, rating } = req.body;
    const newProduct = new product(id, title, price, description, category, image, rating);
    const products = CRUD.readProductsFromFile();
    products.push(newProduct);
    CRUD.writeProductsToFile(products);
    res.status(201).json(newProduct);
});

router.put('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const products = CRUD.readProductsFromFile();
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        const updates = getProductUpdates(req.body);
        products[productIndex] = { id: productId, ...updates };
        CRUD.writeProductsToFile(products);
        res.status(200).json(products[productIndex]);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

router.patch('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const products = CRUD.readProductsFromFile();
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        const updates = getProductUpdates(req.body);
        products[productIndex] = { ...products[productIndex], ...updates, id: productId };
        CRUD.writeProductsToFile(products);
        res.status(200).json(products[productIndex]);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});
router.delete('/products/:id', (req, res) => {
    const products = CRUD.readProductsFromFile();
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        const deletedProduct = products.splice(productIndex, 1);
        fs.writeFileSync('./data.json', JSON.stringify(products, null, 2));
        res.status(200).json(deletedProduct[0]);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

module.exports = router;