const express = require('express');
const router = express.Router();

console.log("TOOL ROUTES LOADED");

const toolController = require('../controllers/toolController');

// 🔥 Use direct functions (avoid destructuring issue)
router.get('/', toolController.getTools);
router.post('/', toolController.createTool);
router.post('/batch-stock', toolController.batchUpdateStock);


router.delete('/:id', toolController.deleteTool);
router.put('/:id', (req, res) => {
  console.log("PUT /api/tools/:id called with ID:", req.params.id);
  console.log("Request body:", req.body);
  toolController.updateTool(req, res);
});

module.exports = router;