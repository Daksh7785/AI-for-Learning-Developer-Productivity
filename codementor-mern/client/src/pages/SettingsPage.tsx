import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Palette, Shield, Save, RefreshCw, Sun, Moon, Monitor, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.patch('/users/profile', { name: profileForm.name });
      if (res.data.success) {
        updateUser(res.data.user);
        success('Profile updated', 'Your changes have been saved.');
      }
    } catch {
      notifyError('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    try {
      await api.delete('/users/account');
      success('Account deleted', 'Your account has been permanently deleted.');
      logout();
      navigate('/');
    } catch {
      notifyError('Failed to delete account');
      setDeleting(false);
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <Layout title="Settings">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Settings</h2>
          <p className="text-slate-400 text-sm">Manage your account preferences.</p>
        </div>

        {/* Profile */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-700">
            <User className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white">Profile</h3>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Display Name</label>
              <input
                value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                value={profileForm.email}
                disabled
                className="w-full px-4 py-2.5 bg-slate-700/30 border border-slate-700 rounded-xl text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        </section>

        {/* Appearance */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-700">
            <Palette className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-white">Appearance</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === value
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-700">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-white">Notifications</h3>
          </div>
          <div className="space-y-4">
            {[
              { key: 'in-app', label: 'In-app notifications', desc: 'Show toast notifications within the app', value: notifications, setter: setNotifications },
              { key: 'email', label: 'Email notifications', desc: 'Receive notifications via email', value: emailNotifications, setter: setEmailNotifications },
            ].map(({ key, label, desc, value, setter }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <button
                  onClick={() => setter(!value)}
                  className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    value ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-slate-800/50 border border-red-800/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-red-800/30">
            <Shield className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold text-red-400">Danger Zone</h3>
          </div>
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Delete Account</p>
                <p className="text-xs text-slate-400">Permanently delete your account and all data. This cannot be undone.</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700/30 text-red-400 rounded-xl text-sm font-medium transition flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-red-300">
                This action is <strong>irreversible</strong>. Type <code className="bg-red-900/30 px-1.5 py-0.5 rounded font-mono">DELETE</code> to confirm.
              </p>
              <input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-4 py-2.5 bg-slate-800 border border-red-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                  className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'DELETE' || deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-40 rounded-xl text-sm font-medium transition"
                >
                  {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
