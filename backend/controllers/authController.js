const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Import the entire shared data store object
const dataStore = require('../dataStore');

const JWT_SECRET = 'your_jwt_secret_key';

// Register new user
exports.register = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Use the shared 'users' array from the dataStore
        const userExists = dataStore.users.find(user => user.username === username);
        if (userExists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            // Increment the shared counter directly on the dataStore object
            id: dataStore.userIdCounter++,
            username,
            password: hashedPassword
        };

        // Push the new user to the shared 'users' array
        dataStore.users.push(newUser);

        const payload = { user: { id: newUser.id, username: newUser.username } };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Login user
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user in the shared 'users' array
        const user = dataStore.users.find(user => user.username === username);
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, username: user.username } };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

