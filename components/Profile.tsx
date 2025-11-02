import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';

interface ProfileProps {
  session: Session;
}

const Profile: React.FC<ProfileProps> = ({ session }) => {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function getProfile() {
      setLoading(true);
      const { user } = session;

      const { data, error } = await supabase
        .from('profiles')
        .select(`full_name, display_name, bio, avatar_url`)
        .eq('id', user.id)
        .single();

      if (isMounted) {
        if (error) {
          console.warn(error);
        } else if (data) {
          setFullName(data.full_name || '');
          setDisplayName(data.display_name || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatar_url || '');
        }
        setLoading(false);
      }
    }

    getProfile();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      alert('You must select an image to upload.');
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setLoading(true);
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
      setLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    if (publicUrlData) {
      setAvatarUrl(publicUrlData.publicUrl);
    }
    setLoading(false);
  };

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    const { user } = session;

    const updates = {
      id: user.id,
      full_name: fullName,
      display_name: displayName,
      bio,
      avatar_url: avatarUrl, // Include avatar_url in updates
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      alert(error.message);
    } else {
      alert('Profile updated successfully!');
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-slate-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-slate-200">User Profile</h2>
        <form onSubmit={updateProfile} className="space-y-4">
          <div className="flex flex-col items-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="rounded-full w-24 h-24 object-cover mb-4" />
            ) : (
              <div className="rounded-full w-24 h-24 bg-slate-700 flex items-center justify-center text-slate-400 text-4xl mb-4">
                ?
              </div>
            )}
            <label htmlFor="avatar" className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg">
              Upload Avatar
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={loading}
              className="hidden"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-400">Email</label>
            <input id="email" type="text" value={session.user.email} disabled className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder-slate-400" />
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-400">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-slate-400">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-400">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <button
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Loading ...' : 'Update'}
            </button>
          </div>

          <div>
            <button
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              type="button"
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
