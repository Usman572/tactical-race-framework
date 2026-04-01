try {
    const vm = require('./middleware/validationMiddleware');
    console.log('Success requiring validationMiddleware from root');
} catch (err) {
    console.error('Failed requiring validationMiddleware from root:', err.message);
}

try {
    const path = require('path');
    const authRoutesPath = path.join(__dirname, 'routes', 'authRoutes.js');
    const ar = require(authRoutesPath);
    console.log('Success requiring authRoutes from root');
} catch (err) {
    console.error('Failed requiring authRoutes from root:', err.message);
}
