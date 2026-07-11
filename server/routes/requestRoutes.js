const express = require('express');
const router = express.Router();
const { protect, managerOnly } = require('../middleware/authMiddleware');

const requestController = require('../controllers/requestController');

// ✅ Routes
console.log("REGISTERING REQUEST ROUTES...");

router.post('/merge/:userId', protect, managerOnly, requestController.mergeRequests);
router.post('/', protect, requestController.createRequest);
router.get('/', protect, requestController.getRequests);
router.put('/:id/approve', protect, managerOnly, requestController.approveRequest);
router.put('/:id/reject', protect, managerOnly, requestController.rejectRequest);
router.put('/:id/printed', protect, managerOnly, requestController.markAsPrinted);
router.put('/:id/hide', protect, managerOnly, requestController.hideRequest);
router.delete('/:id', protect, managerOnly, requestController.deleteRequest);

// ✅ IMPORTANT EXPORT
module.exports = router;