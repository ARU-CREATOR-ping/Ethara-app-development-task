import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiPlus, FiClock, FiUser } from 'react-icons/fi';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'To Do', dueDate: '' });

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        axios.get(`/api/projects/${id}`),
        axios.get(`/api/tasks?project=${id}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching project data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', { ...newTask, project: id });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', status: 'To Do', dueDate: '' });
      fetchProjectData();
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchProjectData();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  if (loading) return <div className="container mt-8"><div className="loader"></div></div>;
  if (!project) return <div className="container mt-8 text-center">Project not found</div>;

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="container project-details-container animate-fade-in">
      <div className="mb-6">
        <Link to="/projects" className="back-link"><FiArrowLeft /> Back to Projects</Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-subtitle">{project.description}</p>
        </div>
        {user.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
            <FiPlus /> Add Task
          </button>
        )}
      </div>

      <div className="kanban-board">
        {['To Do', 'In Progress', 'Done'].map(status => (
          <div key={status} className="kanban-column glass-panel">
            <div className="kanban-header">
              <h3>{status}</h3>
              <span className="task-count">{getTasksByStatus(status).length}</span>
            </div>
            
            <div className="kanban-tasks">
              {getTasksByStatus(status).map(task => (
                <div key={task._id} className="task-card">
                  <h4>{task.title}</h4>
                  {task.description && <p className="task-desc">{task.description}</p>}
                  
                  <div className="task-meta mt-4">
                    {task.dueDate && (
                      <span className="meta-item"><FiClock /> {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                    {task.assignee && (
                      <span className="meta-item"><FiUser /> {task.assignee.name}</span>
                    )}
                  </div>

                  <div className="task-actions mt-4">
                    <select 
                      className="status-select"
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              ))}
              
              {getTasksByStatus(status).length === 0 && (
                <div className="empty-column">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel animate-fade-in">
            <h2 className="mb-6">Add New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  className="input-field" 
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label>Status</label>
                  <select 
                    className="input-field"
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
