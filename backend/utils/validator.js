const sendError = (res, msg) => res.status(400).json({ msg });

exports.validateRegistration = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || username.length < 3) {
        return sendError(res, 'Username must be at least 3 characters long');
    }
    if (!password || password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters long');
    }
    next();
};

exports.validateLogin = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return sendError(res, 'Please provide username and password');
    }
    next();
};

exports.validateProduct = (req, res, next) => {
    const { name, quantity, price } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return sendError(res, 'Valid product name is required');
    }
    if (quantity === undefined || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
        return sendError(res, 'Valid quantity (0 or more) is required');
    }
    if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        return sendError(res, 'Valid price (greater than 0) is required');
    }
    next();
};

exports.validateSale = (req, res, next) => {
    const { productId, quantitySold } = req.body;
    if (!productId || isNaN(parseInt(productId))) {
        return sendError(res, 'Valid productId is required');
    }
    if (!quantitySold || isNaN(parseInt(quantitySold)) || parseInt(quantitySold) <= 0) {
        return sendError(res, 'Valid quantitySold (greater than 0) is required');
    }
    next();
};
