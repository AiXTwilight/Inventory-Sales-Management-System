const dataStore = require('../dataStore');

// Get all products
exports.getAllProducts = (req, res) => {
    res.json(dataStore.products);
};

// Get a single product by ID
exports.getProductById = (req, res) => {
    const product = dataStore.products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(product);
};

// Add a new product
exports.addProduct = (req, res) => {
    const { name, quantity, price } = req.body;
    const newProduct = {
        // Increment the shared counter directly
        id: dataStore.productIdCounter++,
        name,
        quantity: parseInt(quantity),
        price: parseFloat(price)
    };
    // Push to the shared 'products' array
    dataStore.products.push(newProduct);
    res.status(201).json(newProduct);
};

// Update an existing product
exports.updateProduct = (req, res) => {
    const { name, quantity, price } = req.body;
    const productId = parseInt(req.params.id);
    const productIndex = dataStore.products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ msg: 'Product not found' });
    }

    // Update the product in the shared array
    dataStore.products[productIndex] = {
        ...dataStore.products[productIndex],
        name,
        quantity: parseInt(quantity),
        price: parseFloat(price)
    };

    res.json(dataStore.products[productIndex]);
};

// Delete a product
exports.deleteProduct = (req, res) => {
    const productId = parseInt(req.params.id);
    const productIndex = dataStore.products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Remove the product from the shared array
    dataStore.products.splice(productIndex, 1);

    res.json({ msg: 'Product removed' });
};

