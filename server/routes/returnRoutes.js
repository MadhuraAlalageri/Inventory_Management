const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

router.post('/', returnController.createReturnRequest);
router.get('/', returnController.getReturnRequests);
router.put('/:id/approve', returnController.approveReturnRequest);
router.put('/:id/reject', returnController.rejectReturnRequest);

module.exports = router;
