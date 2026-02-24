import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { motion } from 'framer-motion';
import { Layout, Plus, LogOut, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', newProject);
            setNewProject({ name: '', description: '' });
            setIsModalOpen(false);
            fetchProjects();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            <div className="bg-accent-blob"></div>
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-500/20 p-3 rounded-2xl">
                        <Layout className="text-indigo-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Workspace</h1>
                        <p className="text-xs text-dim">Manage your collaborative projects</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-xs text-dim">{user.email}</p>
                    </div>
                    <button onClick={logout} className="p-3 hover:bg-white/5 rounded-2xl text-dim hover:text-danger transition-colors">
                        <LogOut size={22} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="glass border-dashed flex flex-col items-center justify-center p-12 text-dim hover:text-primary hover:border-primary group"
                    style={{ borderStyle: 'dashed', borderWidth: '2px' }}
                >
                    <div className="bg-white/5 p-5 rounded-full mb-4 group-hover:bg-primary/10 transition-colors">
                        <Plus size={40} />
                    </div>
                    <p className="font-bold text-lg">New Project</p>
                    <p className="text-xs mt-2">Create a new collaborative space</p>
                </motion.button>

                {projects.map((project) => (
                    <motion.div
                        layoutId={project.id}
                        key={project.id}
                        className="glass p-8 hover:border-primary/50 transition-all group"
                    >
                        <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                            <Folder className="text-primary" size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{project.name}</h3>
                        <p className="text-dim text-sm mb-8 line-clamp-2 leading-relaxed">{project.description}</p>
                        <Link
                            to={`/project/${project.id}`}
                            className="premium-btn w-full"
                        >
                            Open Workspace
                        </Link>
                    </motion.div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass p-10 w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-3xl font-bold mb-2">New Project</h2>
                        <p className="text-dim text-sm mb-8">Set up your project details to get started.</p>
                        <form onSubmit={handleCreateProject} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dim uppercase tracking-wider ml-1">Project Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter name..."
                                    className="w-full"
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dim uppercase tracking-wider ml-1">Description</label>
                                <textarea
                                    placeholder="What is this project about?"
                                    className="w-full h-32"
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-4 rounded-xl hover:bg-white/5 font-semibold transition-colors">Cancel</button>
                                <button type="submit" className="premium-btn flex-1">Create</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
