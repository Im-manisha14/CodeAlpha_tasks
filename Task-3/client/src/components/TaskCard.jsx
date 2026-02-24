import { motion } from 'framer-motion';
import { Calendar, User } from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
    return (
        <motion.div
            layoutId={task.id}
            whileHover={{ y: -4, scale: 1.02, boxShadow: '0 12px 24px rgba(0,0,0,0.2)' }}
            onClick={() => onClick(task)}
            className="glass p-5 cursor-pointer hover:border-primary/60 group mb-4 last:mb-0 transition-all"
            style={{ borderRadius: '20px' }}
        >
            <h4 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors leading-tight">{task.title}</h4>
            <p className="text-sm text-dim line-clamp-3 mb-5 leading-relaxed">{task.description}</p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs font-medium text-dim">
                    <Calendar size={14} className="text-primary/60" />
                    <span>{task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-dim">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-white/5">
                        <User size={12} className="text-primary" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TaskCard;
