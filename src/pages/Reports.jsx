import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getDashboard } from '../services/userService';

const PRIORITY_COLORS = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };
const PRIORITY_TR = { LOW: 'Düşük', MEDIUM: 'Orta', HIGH: 'Yüksek', CRITICAL: 'Kritik' };
const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center"><div className="text-4xl mb-2">⏳</div><p>Yükleniyor...</p></div>
    </div>
  );

  const priorityData = Object.entries(PRIORITY_TR).map(([key, label]) => ({
    name: label,
    value: stats.recentTasks.filter((t) => t.priority === key).length,
    color: PRIORITY_COLORS[key],
  })).filter((d) => d.value > 0);

  const statusData = stats.tasksByStatus.map((s, i) => ({
    name: s.status,
    value: s.count,
    color: STATUS_COLORS[i % STATUS_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Raporlar</h2>
        <p className="text-gray-500 text-sm mt-1">Proje ve görev istatistikleri</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Proje', value: stats.totalProjects, icon: '📁', color: 'text-blue-600' },
          { label: 'Açık Görev', value: stats.openTasks, icon: '🔄', color: 'text-orange-500' },
          { label: 'Tamamlanan', value: stats.doneTasks, icon: '✅', color: 'text-green-600' },
          { label: 'Son Aktivite', value: stats.recentTasks.length, icon: '📋', color: 'text-purple-600' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
              </div>
              <span className="text-2xl">{c.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proje Tamamlanma */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Proje Tamamlanma Oranı</h3>
          {stats.projects.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Proje yok</div>
          ) : (
            <div className="space-y-3">
              {stats.projects.map((p) => (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium truncate">{p.projectName}</span>
                    <span className="text-gray-500 flex-shrink-0 ml-2">%{p.completionRate} ({p.doneTasks}/{p.totalTasks})</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${p.completionRate}%`, backgroundColor: p.completionRate === 100 ? '#22c55e' : '#3b82f6' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Görev Durumu */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Görev Durumu Dağılımı</h3>
          {statusData.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Atanmış görev yok</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Öncelik Dağılımı */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Öncelik Dağılımı (Son Aktiviteler)</h3>
          {priorityData.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Veri yok</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Proje Detay Tablosu */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Proje Detayları</h3>
          {stats.projects.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Proje yok</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2">Proje</th>
                  <th className="pb-2 text-right">Toplam</th>
                  <th className="pb-2 text-right">Biten</th>
                  <th className="pb-2 text-right">Oran</th>
                </tr>
              </thead>
              <tbody>
                {stats.projects.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="py-2 font-medium text-gray-700">{p.projectName}</td>
                    <td className="py-2 text-right text-gray-500">{p.totalTasks}</td>
                    <td className="py-2 text-right text-gray-500">{p.doneTasks}</td>
                    <td className="py-2 text-right">
                      <span className={`font-semibold ${p.completionRate === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                        %{p.completionRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
