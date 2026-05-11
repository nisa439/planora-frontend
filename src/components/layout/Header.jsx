import { useLocation } from 'react-router-dom';

const titles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projeler',
  '/tasks': 'Görevlerim',
  '/reports': 'Raporlar',
  '/settings': 'Ayarlar',
};

export default function Header() {
  const location = useLocation();
  const title = Object.entries(titles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'Planora';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="text-sm text-gray-500">
        {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </header>
  );
}
