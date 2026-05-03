import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiFolder, FiTrash2, FiUsers } from 'react-icons/fi';
import './Projects.css';

const PROJECT_STATUSES = [
  { id: 'To Do', name: 'To Do', colorClass: 'column-todo' },
  { id: 'In Progress', name: 'In Progress', colorClass: 'column-inprogress' },
  { id: 'Quality Assurance', name: 'Quality Assurance', colorClass: 'column-qa' },
  { id: 'Completed', name: 'Completed', colorClass: 'column-completed' },
  { id: 'Accepted', name: 'Accepted', colorClass: 'column-accepted' }
];

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', members: [] });
  const [errorMsg, setErrorMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProject, setEditProject] = useState({ name: '', description: '', members: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projectsReq = axios.get('/api/projects');
      const usersReq = user.role === 'Admin' ? axios.get('/api/auth/users') : Promise.resolve({ data: [] });
      
      const [projectsRes, usersRes] = await Promise.all([projectsReq, usersReq]);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '', members: [] });
      fetchData();
    } catch (error) {
      console.error('Error creating project', error);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/projects/${selectedProject._id}`, editProject);
      const updatedProject = { ...res.data, attachments: selectedProject.attachments }; // Preserve attachments from state
      setSelectedProject(updatedProject);
      setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating project', error);
      setErrorMsg(error.response?.data?.error || 'Failed to update project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`/api/projects/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting project', error);
      }
    }
  };

  const handleDragStart = (e, projectId) => {
    e.dataTransfer.setData('projectId', projectId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    setErrorMsg('');
    const projectId = e.dataTransfer.getData('projectId');
    if (!projectId) return;

    const projectToUpdate = projects.find(p => p._id === projectId);
    if (!projectToUpdate || projectToUpdate.status === newStatus) return;

    // Optimistic UI update
    const previousProjects = [...projects];
    setProjects(projects.map(p => p._id === projectId ? { ...p, status: newStatus } : p));

    try {
      await axios.put(`/api/projects/${projectId}/status`, { status: newStatus });
    } catch (error) {
      // Revert on error
      setProjects(previousProjects);
      setErrorMsg(error.response?.data?.error || 'Failed to update project status');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedProject) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post(`/api/projects/${selectedProject._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedProject(res.data);
      setProjects(projects.map(p => p._id === res.data._id ? res.data : p));
    } catch (error) {
      console.error('Error uploading file', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getProjectsByStatus = (status) => {
    return projects.filter(p => (p.status || 'To Do') === status);
  };

  if (loading) return <div className="container mt-8"><div className="loader"></div></div>;

  return (
    <div className="container mt-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title">Project Portfolio</h1>
          <p className="page-subtitle">Track high-level progress of all projects across stages</p>
        </div>
        {user.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> New Project
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="card mb-6" style={{ background: '#fff1f1', borderColor: '#ffb3b8', color: '#da1e28', padding: '12px' }}>
          {errorMsg}
        </div>
      )}

      <div className="projects-board-container">
        {PROJECT_STATUSES.map(column => (
          <div 
            key={column.id} 
            className="project-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`project-column-header ${column.colorClass}`}>
              <h3>{column.name}</h3>
              <span className="project-count">{getProjectsByStatus(column.id).length}</span>
            </div>
            
            <div className="project-column-content">
              {getProjectsByStatus(column.id).map(project => (
                <div 
                  key={project._id} 
                  className="project-card-draggable"
                  draggable
                  onDragStart={(e) => handleDragStart(e, project._id)}
                >
                  <div className="project-card-header">
                    <button 
                      onClick={() => setSelectedProject(project)} 
                      className="project-card-title"
                      style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
                    >
                      {project.name}
                    </button>
                    {user.role === 'Admin' && (
                      <button onClick={() => handleDeleteProject(project._id)} className="btn-icon" title="Delete Project">
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  {project.description && (
                    <div className="project-card-desc">{project.description}</div>
                  )}
                  
                  <div className="project-card-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiUsers style={{ display: 'inline' }} />
                      <span title={project.members?.map(m => m.name).join(', ')}>
                        Assignees: {project.members && project.members.length > 0 
                          ? project.members.map(m => m.name).join(', ') 
                          : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {getProjectsByStatus(column.id).length === 0 && (
                <div className="empty-state-column">
                  Drag projects here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content card animate-fade-in">
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
              <div className="input-group">
                <label>Project Members (Hold Ctrl/Cmd to select multiple)</label>
                <select 
                  multiple
                  className="input-field"
                  style={{ height: '100px' }}
                  value={newProject.members}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setNewProject({...newProject, members: selected});
                  }}
                >
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProject && (
        <div className="modal-backdrop">
          <div className="modal-content card animate-fade-in" style={{ maxWidth: '600px' }}>
            <div className="flex justify-between items-start mb-6">
              <h2 style={{ margin: 0 }}>{selectedProject.name}</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge ${PROJECT_STATUSES.find(s => s.id === selectedProject.status)?.colorClass}`} style={{ color: 'white' }}>
                  {selectedProject.status}
                </span>
                {user.role === 'Admin' && !isEditing && (
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setEditProject({
                        name: selectedProject.name,
                        description: selectedProject.description || '',
                        members: selectedProject.members ? selectedProject.members.map(m => m._id) : []
                      });
                      setIsEditing(true);
                    }}
                    style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleUpdateProject} className="mb-6">
                <div className="input-group">
                  <label>Project Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={editProject.name}
                    onChange={(e) => setEditProject({...editProject, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea 
                    className="input-field" 
                    rows="3"
                    value={editProject.description}
                    onChange={(e) => setEditProject({...editProject, description: e.target.value})}
                  ></textarea>
                </div>
                <div className="input-group">
                  <label>Project Members</label>
                  <select 
                    multiple
                    className="input-field"
                    style={{ height: '100px' }}
                    value={editProject.members}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setEditProject({...editProject, members: selected});
                    }}
                  >
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            ) : (
              <>
                <div className="mb-6">
                  <h4 className="mb-2" style={{ color: 'var(--text-secondary)' }}>Description</h4>
                  <p style={{ background: '#f9fafb', padding: '12px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                    {selectedProject.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="mb-2" style={{ color: 'var(--text-secondary)' }}>Assignees</h4>
                  <div className="flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
                    {selectedProject.members && selectedProject.members.length > 0 ? (
                      selectedProject.members.map(m => (
                        <span key={m._id} style={{ background: '#e0e0e0', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem' }}>
                          {m.name}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="mb-2" style={{ color: 'var(--text-secondary)' }}>Attachments</h4>
                  
                  {selectedProject.attachments && selectedProject.attachments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {selectedProject.attachments.map((file, idx) => (
                        <a 
                          key={idx} 
                          href={`http://localhost:5000${file.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f4f4f4', borderRadius: '4px', textDecoration: 'none', color: 'var(--text-primary)' }}
                        >
                          <FiFolder style={{ color: 'var(--primary-color)' }} />
                          <span>{file.filename}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="file" 
                      id="file-upload" 
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <label 
                      htmlFor="file-upload" 
                      className="btn btn-secondary"
                      style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
                    >
                      {uploading ? 'Uploading...' : 'Attach File'}
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-4 mt-8 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button type="button" className="btn btn-primary" onClick={() => { setSelectedProject(null); setIsEditing(false); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
