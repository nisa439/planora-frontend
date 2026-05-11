import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../services/projectService';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ projectName: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetch = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await createProject(form);
      setShowCreate(false);
      setForm({ projectName: '', description: '' });
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Proje oluşturulamadı');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Bu projeyi silmek istediğinden emin misin?')) return;
    try {
      await deleteProject(id);
      fetch();
    } catch {
      alert('Silinemedi — sadece proje admini silebilir');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center"><div className="text-4xl mb-2">⏳</div><p>Yükleniyor...</p></div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Projeler</h2>
          <p className="text-gray-500 text-sm mt-1">{projects.length} proje</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Yeni Proje
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📁</div>
          <p className="text-lg font-medium text-gray-500">Henüz proje yok</p>
          <p className="text-sm mt-1">İlk projeyi oluşturmak için butona tıkla</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Proje Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const isAdmin = p.members.some(
              (m) => m.user.id === user?.id && m.role.name === 'Project Admin'
            );
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}/board`)}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                    {p.projectName[0].toUpperCase()}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDelete(e, p.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-sm"
                      title="Projeyi sil"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <h3 className="font-semibold text-gray-800 mb-1">{p.projectName}</h3>
                {p.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex -space-x-2">
                    {p.members.slice(0, 4).map((m) => (
                      <div
                        key={m.user.id}
                        className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                        title={`${m.user.firstName} ${m.user.lastName}`}
                      >
                        {m.user.firstName[0]}{m.user.lastName[0]}
                      </div>
                    ))}
                    {p.members.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-500 text-xs">
                        +{p.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{p._count.tasks} görev</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-gray-800">Yeni Proje</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Proje Adı *</label>
                <input
                  required
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: E-ticaret Projesi"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Proje hakkında kısa açıklama"
                />
              </div>
              <p className="text-xs text-gray-400">📌 To Do, In Progress ve Done kolonları otomatik oluşturulur</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">İptal</button>
                <button type="submit" disabled={creating} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  {creating ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
