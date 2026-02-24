import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Settings, CheckCircle, Clock, Circle, Folder } from 'lucide-react';
import Column from '../components/Column';

const socket = io('http://localhost:5000');

const Board = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('Todo');
    const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });

    useEffect(() => {
        fetchProjectData();
        socket.emit('join-project', projectId);

        socket.on('task-created', (task) => {
            setTasks(prev => [task, ...prev]);
        });

        socket.on('task-updated', ({ id, status }) => {
            setTasks(prev => prev.map(t => t.id == id ? { ...t, status } : t));
        });

        return () => {
            socket.off('task-created');
            socket.off('task-updated');
        };
    }, [projectId]);

    const fetchProjectData = async () => {
        try {
            const [pRes, tRes] = await Promise.all([
                api.get(`/projects`),
                api.get(`/tasks/${projectId}`)
            ]);
            const currentProject = pRes.data.find(p => p.id == projectId);
            setProject(currentProject);
            setTasks(tRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTask = (status) => {
        setCurrentStatus(status);
        setIsTaskModalOpen(true);
    };

    const submitTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', { ...newTask, project_id: projectId, status: currentStatus });
            setNewTask({ title: '', description: '', deadline: '' });
            setIsTaskModalOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
        } catch (err) {
            console.error(err);
        }
    };

    const filteredTasks = (status) => tasks.filter(t => t.status === status);

    if (!project) return <div className="flex items-center justify-center min-h-screen">Loading Workspace...</div>;

    return (
        <div className="min-h-screen flex flex-col">
            <div className="bg-accent-blob"></div>
            <header className="p-8 glass border-0 border-b border-white/5 sticky top-0 z-40" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/dashboard')} className="p-3 hover:bg-white/5 rounded-2xl text-dim transition-colors">
                            <ArrowLeft size={22} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <Folder className="text-primary" size={20} />
                                <h1 className="text-2xl font-bold">{project.name}</h1>
                            </div>
                            <p className="text-xs text-dim mt-1">Project Board & Collaboration</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleAddTask('Todo')} className="premium-btn text-sm py-3 px-6">
                            <Plus size={18} /> New Task
                        </button>
                        <button className="p-3 hover:bg-white/5 rounded-2xl text-dim">
                            <Settings size={22} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-8 overflow-x-auto">
                <div className="max-w-7xl mx-auto flex gap-8 h-full min-h-[calc(100vh-200px)]">
                    <Column
                        title="To Do"
                        status="Todo"
                        tasks={filteredTasks('Todo')}
                        onAddTask={handleAddTask}
                        onTaskClick={(t) => updateTaskStatus(t.id, 'In Progress')}
                    />
                    <Column
                        title="Working"
                        status="In Progress"
                        tasks={filteredTasks('In Progress')}
                        onAddTask={handleAddTask}
                        onTaskClick={(t) => updateTaskStatus(t.id, 'Done')}
                    />
                    <Column
                        title="Completed"
                        status="Done"
                        tasks={filteredTasks('Done')}
                        onAddTask={handleAddTask}
                        onTaskClick={(t) => updateTaskStatus(t.id, 'Todo')}
                    />
                </div>
            </main>

            <AnimatePresence>
                {isTaskModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass p-10 w-full max-w-md shadow-2xl"
                        >
                            <h2 className="text-3xl font-bold mb-2">New Task</h2>
                            <p className="text-dim text-sm mb-8">Creating a card in <span className="text-primary font-bold">{currentStatus}</span></p>
                            <form onSubmit={submitTask} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dim uppercase tracking-wider ml-1">Title</label>
                                    <input
                                        type="text"
                                        placeholder="What needs to be done?"
                                        className="w-full"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dim uppercase tracking-wider ml-1">Details</label>
                                    <textarea
                                        placeholder="Add more context..."
                                        className="w-full h-32"
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dim uppercase tracking-wider ml-1">Deadline (Optional)</label>
                                    <input
                                        type="date"
                                        className="w-full"
                                        value={newTask.deadline}
                                        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsTaskModalOpen(false)} className="flex-1 p-4 rounded-xl hover:bg-white/5 font-semibold transition-colors">Cancel</button>
                                    <button type="submit" className="premium-btn flex-1">Create Task</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Board;
