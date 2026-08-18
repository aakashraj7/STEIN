import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as neo4jService from '../services/neo4j.service.js';

const router = Router();

// Get full investigation graph for Cytoscape
router.get('/', asyncHandler(async (req, res) => {
  try {
    const graph = await neo4jService.getFullGraph();
    res.json({ success: true, data: graph });
  } catch (err) {
    if (err.status === 503) {
      return res.json({ success: true, data: { nodes: [], edges: [] }, message: 'Neo4j not connected' });
    }
    throw err;
  }
}));

export default router;
