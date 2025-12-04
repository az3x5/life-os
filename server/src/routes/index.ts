import { Router } from 'express';
import notesRouter from './notes';
import remindersRouter from './reminders';
import habitsRouter from './habits';
import financeRouter from './finance';
import healthRouter from './health';
import goalsRouter from './goals';

const router = Router();

// Mount all routes
router.use('/notes', notesRouter);
router.use('/reminders', remindersRouter);
router.use('/habits', habitsRouter);
router.use('/finance', financeRouter);
router.use('/health', healthRouter);
router.use('/goals', goalsRouter);

// Legacy routes for backwards compatibility
router.use('/transactions', financeRouter);

export default router;

