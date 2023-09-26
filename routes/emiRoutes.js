const express = require('express');

const emiController = require('./../controller/emiController');

//it create new route object
const router = express.Router();

//example of alias
// router.route('/rem').get(emiController.aliasTopEmi, emiController.getAllEmi);

router.route('/emi').get(emiController.getAllEmi).post(emiController.createEmi);

router.route('/emi/:date').get(emiController.getEmiByDate);

router
  .route('/:id')
  .patch(emiController.updateEmi)
  .delete(emiController.deleteEmi);

module.exports = router;
