import { Router } from 'express';
import { getMutations, createMutation } from '../controllers/mutationsController.js';

const router = Router();

router.get('/', getMutations);
router.post('/', createMutation);

export default router;
