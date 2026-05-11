import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboard } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const PRIORITY_COLORS = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };
const PRIORITY_TR = { LOW: 'Düşük', MEDIUM: 'Orta', HIGH: 'Yüksek', CRITICAL: 'Kritik' };
const TYPE_TR = { TASK: 'Görev', BUG: 'Hata', FEATURE: 'Özellik', IMPROVEMENT: 'İyileştirme' };
const PIE_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6'];

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(() => setError('Veriler yüklenemedi'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center">
        <div className="text-4xl mb-2">⏳</div>
        <p>Yükleniyor...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400">
      <div className="text-center">
        <div className="text-4xl mb-2">⚠️</div>
        <p>{error}</p>
      </div>
    </div>
  );

  const pieData = stats.tasksByStatus.map((s) => ({ name: s.status, value: s.count }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Hoş geldin, {user?.firstName}! 👋</h2>
        <p className="text-gray-500 mt-1">İşte projelerin ve görevlerinin özeti</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Toplam Proje" value={stats.totalProjects} icon="📁" color="text-blue-600" />
        <StatCard label="Açık Görev" value={stats.openTasks} icon="🔄" color="text-orange-500" />
        <StatCard label="Tamamlanan" value={stats.doneTasks} icon="✅" color="text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Proje Tamamlanma Oranı (%)</h3>
          {stats.projects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📁</p>
              <p className="text-sm">Henüz proje yok</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.projects} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="projectName" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={(v) => [`%${v}`, 'Tamamlanma']} />
                <Bar dataKey="completionRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Görev Durumu Dağılımı</h3>
          {pieData.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm">Atanmış görev yok</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Son Aktiviteler</h3>
        {stats.recentTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">Henüz aktivite yok</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.recentTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => navigate(`/projects/${task.project.id}/board`)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLORS[task.priority] }} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-400">{task.project.projectName} · {task.status.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{TYPE_TR[task.type]}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}>
                    {PRIORITY_TR[task.priority]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats.projects.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Projeler</h3>
          <div className="space-y-3">
            {stats.projects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}/board`)}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                    {p.projectName[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.projectName}</p>
                    <p className="text-xs text-gray-400">{p.totalTasks} görev</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${p.completionRate}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">%{p.completionRate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
