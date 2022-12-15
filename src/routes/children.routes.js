const express = require('express');

const router=express.Router();

const childrenController = require('../controllers/children.controller');

router.post('/profile', childrenController.profileUpload);
router.post('/insert', childrenController.insertNewChild);
router.get('/list', childrenController.listChildren);
router.get('/delete', childrenController.deleteChild);
router.post('/edit', childrenController.editChild);

module.exports=router;