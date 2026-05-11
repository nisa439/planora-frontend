import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { getStatuses } from '../services/projectService';
import { getTasks, createTask, moveTask, updateTask, deleteTask } from '../services/taskService';
import { getProject } from '../services/projectService';
import { useAuth } from '../context/AuthContext';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const PRIORITY_TR = { LOW: 'Düşük', MEDIUM: 'Orta', HIGH: 'Yüksek', CRITICAL: 'Kritik' };
const TYPES = ['TASK', 'BUG', 'FEATURE', 'IMPROVEMENT'];
const TYPE_TR = { TASK: 'Görev', BUG: 'Hata', FEATURE: 'Özellik', IMPROVEMENT: 'İyileştirme' };
const PRIORITY_COLORS = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState(null);
  const [createForm, setCreateForm] = useState({ title: '', description: '', priority: 'MEDIUM', type: 'TASK', assigneeId: '', dueDate: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [selectedTask, setSelectedTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = async () => {
    try {
      const [projRes, statusRes, taskRes] = await Promise.all([
        getProject(id),
        getStatuses(id),
        getTasks(id),
      ]);
      setProject(projRes.data.data);
      setStatuses(statusRes.data.data);
      setTasks(taskRes.data.data);
    } catch {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId = Number(draggableId);
    const newStatusId = Number(destination.droppableId);

    setTasks((prev) => prev.map((t) =>
      t.id === taskId
        ? { ...t, status: statuses.find((s) => s.id === newStatusId) || t.status, order: destination.index }
        : t
    ));

    try {
      await moveTask(taskId, { statusId: newStatusId, order: destination.index });
    } catch {
      fetchAll();
    }
  };

  const openCreate = (status) => {
    setDefaultStatus(status);
    setCreateForm({ title: '', description: '', priority: 'MEDIUM', type: 'TASK', assigneeId: '', dueDate: '' });
    setCreateError('');
    setShowCreate(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await createTask({
        title: createForm.title,
        description: createForm.description || undefined,
        priority: createForm.priority,
        type: createForm.type,
        statusId: defaultStatus.id,
        projectId: Number(id),
        assigneeId: createForm.assigneeId ? Number(createForm.assigneeId) : undefined,
        dueDate: createForm.dueDate || undefined,
      });
      setShowCreate(false);
      fetchAll();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Görev oluşturulamadı');
    } finally {
      setCreating(false);
    }
  };

  const openDetail = (task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      type: task.type,
      statusId: task.status.id,
      assigneeId: task.assignee?.id || '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTask(selectedTask.id, {
        title: editForm.title,
        description: editForm.description || undefined,
        priority: editForm.priority,
        type: editForm.type,
        assigneeId: editForm.assigneeId ? Number(editForm.assigneeId) : null,
        dueDate: editForm.dueDate || null,
      });
      if (Number(editForm.statusId) !== selectedTask.status.id) {
        await moveTask(selectedTask.id, { statusId: Number(editForm.statusId), order: 0 });
      }
      setSelectedTask(null);
      fetchAll();
    } catch {
      alert('Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu görevi silmek istediğinden emin misin?')) return;
    setDeleting(true);
    try {
      await deleteTask(selectedTask.id);
      setSelectedTask(null);
      fetchAll();
    } catch {
      alert('Silinemedi');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center"><div className="text-4xl mb-2">⏳</div><p>Yükleniyor...</p></div>
    </div>
  );

  const members = project?.members || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/projects')} className="hover:text-blue-600">Projeler</button>
            <span>/</span>
            <span className="text-gray-800 font-medium">{project?.projectName}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/projects/${id}/backlog`)}
              className="text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-1 rounded-lg hover:border-blue-300 transition-colors"
            >
              📋 Backlog
            </button>
            <button
              onClick={() => navigate(`/projects/${id}/team`)}
              className="text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-1 rounded-lg hover:border-blue-300 transition-colors"
            >
              👥 Takım ({members.length})
            </button>
          </div>
        </div>
        <button
          onClick={() => openCreate(statuses[0])}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Görev Ekle
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          statuses={statuses}
          tasks={tasks}
          onDragEnd={handleDragEnd}
          onCardClick={openDetail}
          onAddTask={openCreate}
        />
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-gray-800">Yeni Görev — {defaultStatus?.name}</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3">
              {createError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{createError}</div>}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Başlık *</label>
                <input
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Görev başlığı"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Opsiyonel açıklama"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Öncelik</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_TR[p]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tip</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TYPES.map((t) => <option key={t} value={t}>{TYPE_TR[t]}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Atanan Kişi</label>
                  <select
                    value={createForm.assigneeId}
                    onChange={(e) => setCreateForm({ ...createForm, assigneeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Atanmamış</option>
                    {members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.firstName} {m.user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">İptal</button>
                <button type="submit" disabled={creating} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  {creating ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <span className="text-xs text-gray-400">#{selectedTask.id} · {selectedTask.project?.projectName}</span>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Başlık</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Öncelik</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_TR[p]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tip</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TYPES.map((t) => <option key={t} value={t}>{TYPE_TR[t]}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Atanan Kişi</label>
                  <select
                    value={editForm.assigneeId}
                    onChange={(e) => setEditForm({ ...editForm, assigneeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Atanmamış</option>
                    {members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.firstName} {m.user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Durum</label>
                <select
                  value={editForm.statusId}
                  onChange={(e) => setEditForm({ ...editForm, statusId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="pt-1 text-xs text-gray-400 space-y-1">
                <p>Raporlayan: {selectedTask.reporter?.firstName} {selectedTask.reporter?.lastName}</p>
                <p>Oluşturulma: {new Date(selectedTask.createdAt).toLocaleDateString('tr-TR')}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 disabled:opacity-60"
                >
                  {deleting ? '...' : '🗑️ Sil'}
                </button>
                <button onClick={() => setSelectedTask(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">İptal</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
