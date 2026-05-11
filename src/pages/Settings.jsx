import { useState } from 'react';
import { updateProfile, changePassword } from '../services/userService';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });
  const [savingPass, setSavingPass] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ text: '', type: '' });
    try {
      const { data } = await updateProfile(profileForm);
      updateUser(data.data);
      setProfileMsg({ text: 'Profil güncellendi!', type: 'success' });
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || 'Güncellenemedi', type: 'error' });
    } finally { setSavingProfile(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg({ text: 'Yeni şifreler eşleşmiyor', type: 'error' });
      return;
    }
    setSavingPass(true);
    try {
      await changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      setPassMsg({ text: 'Şifre başarıyla değiştirildi!', type: 'success' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassMsg({ text: err.response?.data?.message || 'Şifre değiştirilemedi', type: 'error' });
    } finally { setSavingPass(false); }
  };

  const Msg = ({ msg }) => msg.text ? (
    <div className={`p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
      {msg.text}
    </div>
  ) : null;

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Ayarlar</h2>

      {/* Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <h3 className="font-semibold text-gray-700 mb-4">Profil Bilgileri</h3>
        <form onSubmit={handleProfile} className="space-y-3">
          <Msg msg={profileMsg} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ad</label>
              <input
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Soyad</label>
              <input
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button type="submit" disabled={savingProfile} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
            {savingProfile ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Şifre Değiştir</h3>
        <form onSubmit={handlePassword} className="space-y-3">
          <Msg msg={passMsg} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mevcut Şifre</label>
            <input
              type="password"
              value={passForm.currentPassword}
              onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Yeni Şifre</label>
            <input
              type="password"
              value={passForm.newPassword}
              onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="En az 6 karakter"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              value={passForm.confirmPassword}
              onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••"
            />
          </div>
          <button type="submit" disabled={savingPass} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
            {savingPass ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </button>
        </form>
      </div>
    </div>
  );
}
