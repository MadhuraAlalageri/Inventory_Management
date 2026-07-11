const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const { protect, managerOnly } = require('../middleware/authMiddleware');

router.post('/', protect, returnController.createReturnRequest);
router.get('/', protect, returnController.getReturnRequests);
router.put('/:id/approve', protect, managerOnly, returnController.approveReturnRequest);
router.put('/:id/reject', protect, managerOnly, returnController.rejectReturnRequest);

module.exports = router;
