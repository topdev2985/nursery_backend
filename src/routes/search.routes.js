var router=require('express').Router();

var searchController=require('../controllers/search.controller');

router.get('/fetch', searchController.fetchSearch);

module.exports=router;