
import React, { useState, useEffect } from 'react';
import { User, Camera, Mail, Save } from 'lucide-react';
import { useUser } from '../../../hooks/useData';

const AccountSettings: React.FC = () => {
  const { profile, updateProfile, loading: userLoading } = useUser();

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const handleProfileUpdate = async () => {
    await updateProfile({ name, username, bio });
  };

  if (userLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Profile Information</h3>
            <button onClick={handleProfileUpdate} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
                <Save size={16} />
                <span>Save Changes</span>
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="relative group mx-auto md:mx-0">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden border-2 border-slate-100">
                  <User size={48} />
                </div>
                <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Camera size={24} />
                </button>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-shadow placeholder-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-shadow placeholder-slate-400" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Bio</label>
                  <textarea rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none transition-shadow placeholder-slate-400" value={bio} onChange={e => setBio(e.target.value)} />
                </div>
            </div>
          </div>
      </div>

      {/* Contact Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="email" value={email} readOnly className="w-full pl-10 border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm bg-slate-50 text-slate-500" />
                </div>
              </div>
          </div>
      </div>
      
      {/* Danger Zone */}
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <h3 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-600/80 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-colors shadow-sm">
            Delete Account
          </button>
      </div>
    </div>
  );
}

export default AccountSettings;
