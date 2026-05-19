const express = require('express');
const router = express.Router();

const requestController = require('../controllers/requestController');

// ✅ Routes
console.log("REGISTERING REQUEST ROUTES...");

router.post('/merge/:userId', requestController.mergeRequests);
router.post('/', requestController.createRequest);
router.get('/', requestController.getRequests);
router.put('/:id/approve', requestController.approveRequest);
router.put('/:id/reject', requestController.rejectRequest);
router.put('/:id/printed', requestController.markAsPrinted);
router.put('/:id/hide', requestController.hideRequest);
router.delete('/:id', requestController.deleteRequest);

// ✅ IMPORTANT EXPORT
module.exports = router;