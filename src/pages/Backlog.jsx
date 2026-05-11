import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTasks } from '../services/taskService';
import { getProject } from '../services/projectService';

const PRIORITY_STYLES = {
  LOW:      { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Düşük' },
  MEDIUM:   { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Orta' },
  HIGH:     { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Yüksek' },
  CRITICAL: { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Kritik' },
};
const TYPE_TR = { TASK: '📋 Görev', BUG: '🐛 Hata', FEATURE: '✨ Özellik', IMPROVEMENT: '⚡ İyileştirme' };

export default function Backlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ priority: '' });

  useEffect(() => {
    Promise.all([getProject(id), getTasks(id, filter)])
      .then(([pRes, tRes]) => {
        setProject(pRes.data.data);
        setTasks(tRes.data.data);
      })
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [id, filter]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center"><div className="text-4xl mb-2">⏳</div><p>Yükleniyor...</p></div>
    </div>
  );

  const grouped = tasks.reduce((acc, t) => {
    const key = t.status.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/projects')} className="hover:text-blue-600">Projeler</button>
            <span>/</span>
            <button onClick={() => navigate(`/projects/${id}/board`)} className="hover:text-blue-600">{project?.projectName}</button>
            <span>/</span>
            <span className="text-gray-800">Backlog</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Backlog</h2>
          <p className="text-gray-500 text-sm mt-1">{tasks.length} görev</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ priority: e.target.value })}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Öncelikler</option>
            <option value="CRITICAL">Kritik</option>
            <option value="HIGH">Yüksek</option>
            <option value="MEDIUM">Orta</option>
            <option value="LOW">Düşük</option>
          </select>
          <button
            onClick={() => navigate(`/projects/${id}/board`)}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            📋 Board
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg font-medium text-gray-500">Backlog boş</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([status, statusTasks]) => (
            <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <h3 className="font-semibold text-gray-700 text-sm">{status}</h3>
                <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">{statusTasks.length}</span>
              </div>
              <table className="w-full">
                <tbody>
                  {statusTasks.map((task, i) => {
                    const p = PRIORITY_STYLES[task.priority];
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                    return (
                      <tr
                        key={task.id}
                        className={`border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
                        onClick={() => navigate(`/projects/${id}/board`)}
                      >
                        <td className="px-4 py-3 w-8 text-gray-400 text-xs">#{task.id}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800">{task.title}</p>
                          {task.description && <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{task.description}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{TYPE_TR[task.type]}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.bg} ${p.text}`}>{p.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          {task.assignee ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                {task.assignee.firstName[0]}
                              </div>
                              <span className="text-xs text-gray-500">{task.assignee.firstName}</span>
                            </div>
                          ) : <span className="text-xs text-gray-300">—</span>}
                        </td>
                        <td className={`px-4 py-3 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
