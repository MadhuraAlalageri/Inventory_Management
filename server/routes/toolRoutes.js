const express = require('express');
const router = express.Router();
const { protect, managerOnly } = require('../middleware/authMiddleware');

console.log("TOOL ROUTES LOADED");

const toolController = require('../controllers/toolController');

// 🔥 Use direct functions (avoid destructuring issue)
router.get('/', protect, toolController.getTools);
router.post('/', protect, managerOnly, toolController.createTool);
router.post('/batch-stock', protect, managerOnly, toolController.batchUpdateStock);

router.delete('/:id', protect, managerOnly, toolController.deleteTool);
router.put('/:id', protect, managerOnly, (req, res) => {
  console.log("PUT /api/tools/:id called with ID:", req.params.id);
  console.log("Request body:", req.body);
  toolController.updateTool(req, res);
});

module.exports = router;