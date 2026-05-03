import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiClock, FiAlertCircle, FiFolder } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    tasksTodo: 0,
    tasksInProgress: 0,
    tasksDone: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          axios.get('/api/projects'),
          axios.get('/api/tasks')
        ]);
        
        const tasks = tasksRes.data;
        const myTasks = user.role === 'Admin' ? tasks : tasks.filter(t => t.assignee?._id === user.id);
        
        setStats({
          totalProjects: projectsRes.data.length,
          tasksTodo: myTasks.filter(t => t.status === 'To Do').length,
          tasksInProgress: myTasks.filter(t => t.status === 'In Progress').length,
          tasksDone: myTasks.filter(t => t.status === 'Done').length
        });
        
        // Get 5 most recent tasks
        setRecentTasks(myTasks.slice(-5).reverse());
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  if (loading) return <div className="container mt-8"><div className="loader"></div></div>;

  return (
    <div className="container dashboard-container animate-fade-in">
      <div className="dashboard-header mb-8">
        <h1>Welcome, {user.name}! 👋</h1>
        <p>Here's what's happening with your projects today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-color)' }}>
            <FiFolder />
          </div>
          <div className="stat-info">
            <h3>{stats.totalProjects}</h3>
            <p>Total Projects</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning-color)' }}>
            <FiAlertCircle />
          </div>
          <div className="stat-info">
            <h3>{stats.tasksTodo}</h3>
            <p>To Do Tasks</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.2)', color: 'var(--secondary-color)' }}>
            <FiClock />
          </div>
          <div className="stat-info">
            <h3>{stats.tasksInProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-color)' }}>
            <FiCheckCircle />
          </div>
          <div className="stat-info">
            <h3>{stats.tasksDone}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content grid md:grid-cols-2 gap-6 mt-8">
        <div className="glass-panel">
          <h2 className="mb-4">Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <p className="empty-state">No recent tasks found.</p>
          ) : (
            <div className="recent-tasks-list">
              {recentTasks.map(task => (
                <div key={task._id} className="task-item">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <span className="task-project">{task.project?.name}</span>
                  </div>
                  <span className={`badge badge-${task.status.toLowerCase().replace(' ', '')}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
