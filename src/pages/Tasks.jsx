import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTasks } from '../services/taskService';

const PRIORITY_STYLES = {
  LOW:      { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Düşük' },
  MEDIUM:   { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Orta' },
  HIGH:     { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Yüksek' },
  CRITICAL: { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Kritik' },
};
const TYPE_TR = { TASK: 'Görev', BUG: 'Hata', FEATURE: 'Özellik', IMPROVEMENT: 'İyileştirme' };

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ priority: '', status: '' });

  useEffect(() => {
    getMyTasks(filter)
      .then(({ data }) => setTasks(data.data))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center"><div className="text-4xl mb-2">⏳</div><p>Yükleniyor...</p></div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Görevlerim</h2>
          <p className="text-gray-500 text-sm mt-1">Bana atanan {tasks.length} görev</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Öncelikler</option>
            <option value="CRITICAL">Kritik</option>
            <option value="HIGH">Yüksek</option>
            <option value="MEDIUM">Orta</option>
            <option value="LOW">Düşük</option>
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-lg font-medium text-gray-500">Görev yok</p>
          <p className="text-sm mt-1">Sana atanmış görev bulunmuyor</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Görev</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Proje</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tip</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Öncelik</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Bitiş</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => {
                const p = PRIORITY_STYLES[task.priority];
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <tr
                    key={task.id}
                    onClick={() => navigate(`/projects/${task.project.id}/board`)}
                    className={`border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{task.title}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{task.project.projectName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{TYPE_TR[task.type]}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.bg} ${p.text}`}>{p.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{task.status.name}</td>
                    <td className={`px-4 py-3 text-sm ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
