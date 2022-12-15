const router=require('express').Router();

const invoiceController=require('../controllers/invoice.controller');

router.get('/fetch', invoiceController.fecthInvoice);

module.exports=router;

