const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields required' });
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'User already exists' });

        const hashed = await bcrypt.hash(password, 10);

        // Generate slug from name
        let baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        if (!baseSlug) baseSlug = 'user';
        let slug = baseSlug;
        let counter = 1;
        while (await User.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const user = await User.create({ name, email, password: hashed, slug, role: role || 'user' });

        const token = generateToken(user);
        res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, slug: user.slug, profilePicture: user.profilePicture, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields required' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = generateToken(user);

        // Fallback: Ensure user has a slug if it was somehow missing (legacy users)
        if (!user.slug) {
            let nameToSlug = user.name || 'user';
            let baseSlug = nameToSlug.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            if (!baseSlug) baseSlug = 'user';
            let slug = baseSlug;
            let counter = 1;
            while (await User.findOne({ slug })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
            user.slug = slug;
            await user.save();
        }

        res.json({ id: user._id, name: user.name, email: user.email, role: user.role, slug: user.slug, profilePicture: user.profilePicture, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser };
