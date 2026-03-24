const User = require('../models/User'); // Fixed: was '../models/userModel' which doesn't exist

const generateUniqueSlug = async (name) => {
    let nameToSlug = name || 'user';
    let baseSlug = nameToSlug.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!baseSlug) baseSlug = 'user';
    let slug = baseSlug;
    let counter = 1;
    while (await User.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
};

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        // Lazy migration: Generate slugs for users who don't have them
        const updatedUsers = await Promise.all(users.map(async (u) => {
            if (!u.slug) {
                const slug = await generateUniqueSlug(u.name);
                return await User.findByIdAndUpdate(u._id, { slug }, { new: true }).select('-password');
            }
            return u;
        }));

        res.json(updatedUsers);
    } catch (err) {
        console.error('getUsers error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single user by ID or Slug
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Backend: Fetching user with identifier: ${id}`);

        let user;
        // Check if id is a valid MongoID
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(id).select('-password');
        } else {
            user = await User.findOne({ slug: id }).select('-password');
        }

        if (!user) {
            console.log(`Backend: User not found for identifier: ${id}`);
            return res.status(404).json({ message: 'User not found' });
        }

        // Lazy migration: Generate slug if missing
        if (!user.slug) {
            user.slug = await generateUniqueSlug(user.name);
            await user.save();
        }

        res.json(user);
    } catch (err) {
        console.error('getUserById error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a user
const updateUser = async (req, res) => {
    try {
        const { role, profilePicture, faction } = req.body;

        // Check if user is updating themselves or is an admin
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updates = {};
        if (role && req.user.role === 'admin') updates.role = role;
        if (profilePicture !== undefined) updates.profilePicture = profilePicture;
        if (faction !== undefined) updates.faction = faction;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('updateUser error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5005}`;
        const profilePictureUrl = `${appUrl}/uploads/profiles/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: profilePictureUrl },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error('uploadProfilePicture error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find()
            .select('name profilePicture stats role slug xp level faction')
            .sort({ xp: -1, 'stats.wins': -1 })
            .limit(50);
        res.json(users);
    } catch (err) {
        console.error('getLeaderboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, uploadProfilePicture, getLeaderboard };
