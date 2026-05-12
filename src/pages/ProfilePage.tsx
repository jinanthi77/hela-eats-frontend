import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProfile, updateProfile, uploadProfilePicture, deleteProfilePicture } from '../services/userService';
import { useToast } from '../components/Toast';
import type { User, Address } from '../types';
import { User as UserIcon, MapPin, Loader2, Save, Plus, X, ShieldCheck, Camera, Trash2 } from 'lucide-react';

// const DIETARY_OPTIONS = ['None', 'Fitness', 'Low-Glycemic', 'Vegetarian', 'Vegan'] as const;

const ProfilePage = () => {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Picture
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // const [dietary, setDietary] = useState<string>('None');
  // const [allergies, setAllergies] = useState<string[]>([]);
  // const [newAllergy, setNewAllergy] = useState('');

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [addressFullName, setAddressFullName] = useState('');
  const [addressZipcode, setAddressZipcode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressCity, setAddressCity] = useState('');


  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        // setDietary(data.healthProfile?.dietaryPreference || 'None');
        // setAllergies(data.healthProfile?.allergies || []);
      } catch { showToast('Failed to load profile', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        name,
        phone,
        // healthProfile: { dietaryPreference: dietary as any, allergies },
      });
      setProfile(updated);
      await refreshUser();
      showToast('Profile updated!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update', 'error');
    } finally { setSaving(false); }
  };

  const handleAddAddress = async () => {
    if (!addressLabel || !addressFullName || !addressLine1 || !addressCity) return;
    setSaving(true);
    try {
      const newAddress: Address = {
        label: addressLabel, fullName: addressFullName, phone: addressZipcode,
        addressLine1: addressLine1, addressLine2: addressLine2, city: addressCity, isDefault: false,
      };
      const currentAddresses = profile?.addresses || [];
      const updated = await updateProfile({ addresses: [...currentAddresses, newAddress] });
      setProfile(updated);
      await refreshUser();
      setShowAddressForm(false);
      setAddressLabel(''); setAddressFullName(''); setAddressZipcode('');
      setAddressLine1(''); setAddressLine2(''); setAddressCity('');
      showToast('Address added!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add address', 'error');
    } finally { setSaving(false); }
  };

  // const handleAddAllergy = () => {
  //   if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
  //     setAllergies([...allergies, newAllergy.trim()]);
  //     setNewAllergy('');
  //   }
  // };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const res = await uploadProfilePicture(file);
      setProfile(prev => prev ? { ...prev, profilePicture: res.profilePicture } : prev);
      await refreshUser();
      showToast('Profile picture updated!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageDelete = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    setUploadingImage(true);
    try {
      await deleteProfilePicture();
      setProfile(prev => prev ? { ...prev, profilePicture: undefined } : prev);
      await refreshUser();
      showToast('Profile picture removed', 'info');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to remove image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-8">
        <UserIcon className="h-8 w-8 text-brand" /> My Profile
      </h1>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-8 items-start mb-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              {profile?.profilePicture?.url ? (
                <img src={profile.profilePicture.url} alt="Profile" className="h-28 w-28 rounded-full object-cover border-4 border-brand-light/30 shadow-md" />
              ) : (
                <div className="h-28 w-28 rounded-full bg-brand-light/30 flex items-center justify-center border-4 border-white shadow-md">
                  <UserIcon className="h-12 w-12 text-brand-light" />
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="p-2 bg-brand hover:bg-brand-dark text-white rounded-full shadow-lg transition-colors disabled:opacity-50"
                  title="Upload picture"
                >
                  <Camera className="h-4 w-4" />
                </button>
                {profile?.profilePicture?.url && (
                  <button
                    onClick={handleImageDelete}
                    disabled={uploadingImage}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full shadow-lg transition-colors border border-red-100 disabled:opacity-50"
                    title="Remove picture"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-brand focus:border-brand transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={profile?.email || ''} disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-brand focus:border-brand transition-colors"
                  placeholder="+94 71 234 5678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500">
                  <ShieldCheck className="h-4 w-4" /> {profile?.role || 'user'}
                </div>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-dark hover:bg-brand-dark text-white font-bold rounded-xl transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Health Profile */}
      {/* 
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" /> Health Profile
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Preference</label>
          <select value={dietary} onChange={(e) => setDietary(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-brand focus:border-brand">
            {DIETARY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {allergies.map((allergy, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                {allergy}
                <button onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))} className="hover:text-red-800">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAllergy()}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-brand focus:border-brand transition-colors text-sm"
              placeholder="Add allergy (e.g. nuts)" />
            <button onClick={handleAddAllergy} className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      */}

      {/* Addresses */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand" /> Addresses
          </h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)}
            className="text-sm text-brand hover:text-brand-dark font-medium flex items-center gap-1">
            {showAddressForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAddressForm ? 'Cancel' : 'Add'}
          </button>
        </div>
        {profile?.addresses && profile.addresses.length > 0 ? (
          <div className="space-y-3">
            {profile.addresses.map((addr, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-brand bg-brand-light/30 px-2 py-0.5 rounded-full">{addr.label}</span>
                  {addr.isDefault && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Default</span>}
                </div>
                <p className="text-sm text-gray-700 font-medium">{addr.fullName}</p>
                <p className="text-xs text-gray-500">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}</p>
                <p className="text-xs text-gray-500">{addr.phone}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No addresses saved yet.</p>
        )}

        {showAddressForm && (
          <div className="mt-4 p-4 bg-brand-light/30 rounded-xl border border-brand-light animate-[fadeInUp_0.2s_ease]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input type="text" value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)} placeholder="Label (e.g. Home)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
              <input type="text" value={addressFullName} onChange={(e) => setAddressFullName(e.target.value)} placeholder="Full Name" className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
              <input type="text" value={addressZipcode} onChange={(e) => setAddressZipcode(e.target.value)} placeholder="Zipcode" className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
              <input type="text" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="City" className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
              <input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Address Line 1" className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white sm:col-span-2" />
              <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Address Line 2 (optional)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white sm:col-span-2" />
            </div>
            <button onClick={handleAddAddress} disabled={saving}
              className="px-5 py-2 bg-brand-dark hover:bg-brand-dark text-white font-bold rounded-lg transition-colors text-sm disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Address'}
            </button>
          </div>
        )}
      </div>

      {/* Pantry */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand" /> My Pantry
          </h2>
          <a href="/pantry" className="text-sm text-brand hover:text-brand-dark font-medium flex items-center gap-1">
            Manage Pantry →
          </a>
        </div>
        {profile?.pantry && profile.pantry.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.pantry.map((item, i) => {
              const ingName = typeof item.ingredientId === 'object' ? item.ingredientId.name : 'Unknown';
              return (
                <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full text-sm font-medium border border-emerald-100">
                  {ingName}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Your pantry is empty. Add ingredients you already have at home to save on your next order!</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
