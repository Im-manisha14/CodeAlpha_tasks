import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

const Column = ({ title, status, tasks, onAddTask, onTaskClick }) => {
    return (
        <div className="flex flex-col w-full min-w-[280px] sm:min-w-[350px] h-full">
            <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${status === 'Done' ? 'bg-success' : status === 'In Progress' ? 'bg-warning' : 'bg-primary'}`}></div>
                    <h3 className="font-bold text-xl tracking-tight">{title}</h3>
                    <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold text-dim border border-white/5">{tasks.length}</span>
                </div>
                <button
                    onClick={() => onAddTask(status)}
                    className="p-2 hover:bg-white/10 rounded-xl text-dim hover:text-primary transition-colors"
                >
                    <Plus size={22} />
                </button>
            </div>

            <div className="bg-white/5 rounded-[28px] p-4 flex-1 overflow-y-auto min-h-[500px] border border-white/5">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                ))}
                {tasks.length === 0 && (
                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-dim text-sm italic gap-2">
                        <Plus size={24} className="opacity-20" />
                        <span>No tasks in {title}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Column;
