import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import './Projects.css';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/api/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project', error);
    }
  };

  if (loading) return <div className="container mt-8"><div className="loader"></div></div>;

  return (
    <div className="container projects-container animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your team's workspaces and projects</p>
        </div>
        {user.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="glass-panel text-center py-16">
          <h3>No projects found</h3>
          <p className="text-secondary mt-2">Get started by creating your first project.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link to={`/projects/${project._id}`} key={project._id} className="project-card glass-panel">
              <div className="flex justify-between items-start mb-4">
                <div className="project-icon">
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <button className="btn-icon"><FiMoreVertical /></button>
              </div>
              <h3>{project.name}</h3>
              <p className="project-desc">{project.description || 'No description provided.'}</p>
              <div className="project-footer mt-6">
                <span className="owner-badge">By {project.owner?.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel animate-fade-in">
            <h2 className="mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="input-group">
                <label>Project Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  className="input-field" 
                  rows="3"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                ></textarea>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
