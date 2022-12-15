var express = require('express');
var serviceController = require('../controllers/servcies.controller');

var router = express.Router();

router.post('/insert', serviceController.insertService);
router.get('/list', serviceController.fetchService);
router.get('/delete', serviceController.deleteService);

module.exports = router;
