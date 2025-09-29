const dataStore = require('../dataStore');

exports.getDashboardSummary = (req, res) => {
    try {
        // Calculate total sales value from the shared 'sales' array
        const totalSales = dataStore.sales.reduce((acc, sale) => acc + sale.totalAmount, 0);

        // Calculate total inventory count from the shared 'products' array
        const totalInventory = dataStore.products.reduce((acc, product) => acc + product.quantity, 0);

        // Count number of unique products
        const productCount = dataStore.products.length;

        // Get recent sales (last 5) from a sorted copy of the shared 'sales' array
        const recentSales = [...dataStore.sales]
            .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
            .slice(0, 5);

        const summary = {
            totalSales: totalSales.toFixed(2),
            totalInventory,
            productCount,
            recentSales
        };

        res.json(summary);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

