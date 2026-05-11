import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';

const COLUMN_COLORS = {
  'To Do':       'border-t-gray-400',
  'In Progress': 'border-t-blue-500',
  'Done':        'border-t-green-500',
};

export default function KanbanBoard({ statuses, tasks, onDragEnd, onCardClick, onAddTask }) {
  const tasksByStatus = statuses.reduce((acc, s) => {
    acc[s.id] = tasks.filter((t) => t.status.id === s.id);
    return acc;
  }, {});

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {statuses.map((status) => (
          <div
            key={status.id}
            className={`flex-shrink-0 w-72 bg-gray-50 rounded-xl border-t-4 ${COLUMN_COLORS[status.name] || 'border-t-gray-300'} flex flex-col`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-700 text-sm">{status.name}</h3>
                <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 font-medium">
                  {tasksByStatus[status.id]?.length || 0}
                </span>
              </div>
              <button
                onClick={() => onAddTask(status)}
                className="w-6 h-6 rounded-md bg-white border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors text-lg leading-none flex items-center justify-center"
                title="Görev ekle"
              >
                +
              </button>
            </div>

            {/* Cards */}
            <Droppable droppableId={String(status.id)}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 px-3 pb-3 space-y-2 min-h-[100px] rounded-b-xl transition-colors ${
                    snapshot.isDraggingOver ? 'bg-blue-50' : ''
                  }`}
                >
                  {tasksByStatus[status.id]?.map((task, index) => (
                    <KanbanCard key={task.id} task={task} index={index} onClick={onCardClick} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
