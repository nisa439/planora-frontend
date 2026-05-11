import { Draggable } from '@hello-pangea/dnd';

const PRIORITY_STYLES = {
  LOW:      { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Düşük' },
  MEDIUM:   { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Orta' },
  HIGH:     { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Yüksek' },
  CRITICAL: { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Kritik' },
};

const TYPE_ICONS = { TASK: '📋', BUG: '🐛', FEATURE: '✨', IMPROVEMENT: '⚡' };

export default function KanbanCard({ task, index, onClick }) {
  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all select-none ${
            snapshot.isDragging ? 'shadow-lg rotate-1 border-blue-300' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs text-gray-400">{TYPE_ICONS[task.type]} #{task.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.bg} ${priority.text}`}>
              {priority.label}
            </span>
          </div>

          <p className="text-sm font-medium text-gray-800 leading-snug mb-3">{task.title}</p>

          <div className="flex items-center justify-between">
            {task.assignee ? (
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                  {task.assignee.firstName[0]}{task.assignee.lastName[0]}
                </div>
                <span className="text-xs text-gray-500 truncate max-w-[80px]">
                  {task.assignee.firstName}
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-300">Atanmamış</span>
            )}

            {task.dueDate && (
              <span className={`text-xs ${new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                📅 {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
