const router = require('express').Router();
// import routes
const htmlRoutes = require('./html/html-routes');
const apiRoutes = require('./api');

// add prefix of `/api` to api routes
router.use('/api', apiRoutes);
router.use('/', htmlRoutes);

router.use((req, res) => {
  res.status(404).send('<h1>😝 404 Error!</h1>');
});

module.exports = router;
