import express from 'express';
import Task from '../models/Task.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { project, assignee, status } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (assignee) filter.assignee = assignee;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignee', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const { title, description, status, dueDate, project, assignee } = req.body;
    const task = new Task({
      title,
      description,
      status,
      dueDate,
      project,
      assignee
    });
    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignee', 'name email');
      
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Error creating task' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, dueDate, assignee } = req.body;
    
    // Member can only update status
    let updateData = {};
    if (req.user.role === 'Admin') {
      updateData = { title, description, status, dueDate, assignee };
    } else {
      updateData = { status };
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('project', 'name')
     .populate('assignee', 'name email');
     
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error updating task' });
  }
});

router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting task' });
  }
});

export default router;
