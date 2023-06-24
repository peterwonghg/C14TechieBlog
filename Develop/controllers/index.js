const router = require('express').Router();
const apiRoutes = require('./api');
const webRoutes = require('./web/web');

router.use('/api', apiRoutes);
router.use(webRoutes);

module.exports = router;
