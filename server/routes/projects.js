import express from 'express';
import multer from 'multer';
import path from 'path';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', auth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'Admin') {
      filter = { members: req.user.userId };
    }
    const projects = await Project.find(filter)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching project' });
  }
});

router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = new Project({
      name,
      description,
      owner: req.user.userId,
      members: members || []
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error creating project' });
  }
});

router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, members },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error updating project' });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (req.user.role !== 'Admin') {
      if (!project.members.includes(req.user.userId)) {
        return res.status(403).json({ error: 'Not authorized to update this project' });
      }
      if (status === 'Accepted') {
        return res.status(403).json({ error: 'Only Admins can mark a project as Accepted' });
      }
    }

    project.status = status;
    await project.save();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error updating project status' });
  }
});

router.put('/:id/urgent', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (req.user.role !== 'Admin' && !project.members.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    project.isUrgent = !project.isUrgent;
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error updating urgency' });
  }
});

router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Also delete tasks associated with this project
    await Task.deleteMany({ project: req.params.id });
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting project' });
  }
});

router.post('/:id/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Verify user is member or admin
    if (req.user.role !== 'Admin' && !project.members.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const newAttachment = {
      filename: req.file.originalname,
      url: `/uploads/${req.file.filename}`
    };

    project.attachments.push(newAttachment);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error uploading file' });
  }
});

export default router;
