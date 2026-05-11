import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProject, addMember, removeMember } from '../services/projectService';
import { searchUsers } from '../services/userService';
import { useAuth } from '../context/AuthContext';

export default function Team() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(null);

  const fetch = async () => {
    try {
      const { data } = await getProject(id);
      setProject(data.data);
    } catch { navigate('/projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [id]);

  const handleSearch = async (q) => {
    setSearchQ(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await searchUsers(q, Number(id));
      setSearchResults(data.data);
    } finally { setSearching(false); }
  };

  const handleAdd = async (userId) => {
    setAdding(userId);
    try {
      await addMember(id, userId);
      setSearchQ('');
      setSearchResults([]);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Eklenemedi');
    } finally { setAdding(null); }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Bu üyeyi çıkarmak istediğinden emin misin?')) return;
    try {
      await removeMember(id, userId);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Çıkarılamadı');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center"><div className="text-4xl mb-2">⏳</div><p>Yükleniyor...</p></div>
    </div>
  );

  const isAdmin = project?.members.some((m) => m.user.id === user?.id && m.role.name === 'Project Admin');

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
        <button onClick={() => navigate('/projects')} className="hover:text-blue-600">Projeler</button>
        <span>/</span>
        <button onClick={() => navigate(`/projects/${id}/board`)} className="hover:text-blue-600">{project?.projectName}</button>
        <span>/</span>
        <span className="text-gray-800">Takım</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Takım Üyeleri</h2>

      {/* Member List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {project?.members.map((m, i) => (
          <div key={m.user.id} className={`flex items-center justify-between px-5 py-4 ${i < project.members.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {m.user.firstName[0]}{m.user.lastName[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{m.user.firstName} {m.user.lastName}</p>
                <p className="text-xs text-gray-400">{m.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${m.role.name === 'Project Admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {m.role.name === 'Project Admin' ? '👑 Admin' : '👤 Üye'}
              </span>
              {isAdmin && m.user.id !== user?.id && (
                <button
                  onClick={() => handleRemove(m.user.id)}
                  className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                >
                  Çıkar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Member */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Üye Ekle</h3>
          <div className="relative">
            <input
              value={searchQ}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="İsim veya email ile ara..."
            />
            {searching && <div className="absolute right-3 top-3 text-gray-400 text-xs">Aranıyor...</div>}
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
              {searchResults.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-medium">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdd(u.id)}
                    disabled={adding === u.id}
                    className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    {adding === u.id ? '...' : 'Ekle'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQ.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-sm text-gray-400 mt-2 text-center py-3">Kullanıcı bulunamadı</p>
          )}
        </div>
      )}
    </div>
  );
}
