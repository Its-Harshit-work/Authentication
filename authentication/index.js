// Import dependencies
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    organization: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Signup route
app.post('/signup', async (req, res) => {
    const { username, email, password, organization } = req.body;

    if (!username || !email || !password || !organization) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, organization });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const user = await User.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail },
            ],
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied, no token provided' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Example protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Welcome to the protected route!', user: req.user });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
