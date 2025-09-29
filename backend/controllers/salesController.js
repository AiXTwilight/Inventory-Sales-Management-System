const dataStore = require('../dataStore');

// Record a new sale
exports.recordSale = (req, res) => {
    const { productId, quantitySold } = req.body;

    // Find the product in the shared 'products' array
    const product = dataStore.products.find(p => p.id === parseInt(productId));

    if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
    }

    if (product.quantity < quantitySold) {
        return res.status(400).json({ msg: 'Not enough stock available' });
    }

    // IMPORTANT: This modifies the quantity on the product object within the shared 'products' array
    product.quantity -= parseInt(quantitySold);

    const newSale = {
        // Increment the shared counter directly
        id: dataStore.saleIdCounter++,
        productId: product.id,
        productName: product.name,
        quantitySold: parseInt(quantitySold),
        totalAmount: parseInt(quantitySold) * product.price,
        saleDate: new Date()
    };

    // Push the new sale to the shared 'sales' array
    dataStore.sales.push(newSale);
    res.status(201).json(newSale);
};

// Get sales history
exports.getSalesHistory = (req, res) => {
    // Return a sorted copy of the shared 'sales' array
    res.json([...dataStore.sales].sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate)));
};

