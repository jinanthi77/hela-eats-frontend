import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProfile, updateProfile, uploadProfilePicture, deleteProfilePicture, addAddress } from '../services/userService';
import { useToast } from '../components/Toast';
import type { User } from '../types';
import { User as UserIcon, MapPin, Loader2, Save, Plus, X, ShieldCheck, Camera, Trash2, Carrot } from 'lucide-react';

const ProfilePage = () => {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [addressFullName, setAddressFullName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressZipcode, setAddressZipcode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressCity, setAddressCity] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
      } catch {
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [showToast]);

  const handleSave = async () => {
    if (phone) {
      const digitsOnly = phone.replace(/[\s\-()]/g, '');
      if (!/^\d{10}$/.test(digitsOnly)) {
        showToast('Phone number must be exactly 10 digits', 'error');
        return;
      }
    }
    setSaving(true);
    try {
      const updated = await updateProfile({ name, phone });
      setProfile(updated);
      await refreshUser();
      showToast('Profile updated!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!addressFullName || !addressLine1 || !addressCity) {
      showToast('Please fill in required fields (Full Name, Address Line 1, City)', 'error');
      return;
    }

    if (addressPhone) {
      const digitsOnly = addressPhone.replace(/[\s\-()]/g, '');
      if (!/^\d{10}$/.test(digitsOnly)) {
        showToast('Address phone number must be exactly 10 digits', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await addAddress({
        label: addressLabel.trim() || 'Home',
        fullName: addressFullName,
        phone: addressPhone,
        addressLine1,
        addressLine2,
        city: addressCity,
        postalCode: addressZipcode,
      });
      setProfile((prev) => prev ? { ...prev, addresses: res.addresses } : prev);
      await refreshUser();
      setShowAddressForm(false);
      setAddressLabel('');
      setAddressFullName('');
      setAddressPhone('');
      setAddressZipcode('');
      setAddressLine1('');
      setAddressLine2('');
      setAddressCity('');
      showToast('Address added successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add address', 'error');
    } finally {
      setSaving(false);
    }
  };

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
      setProfile((prev) => (prev ? { ...prev, profilePicture: res.profilePicture } : prev));
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
      setProfile((prev) => (prev ? { ...prev, profilePicture: undefined } : prev));
      await refreshUser();
      showToast('Profile picture removed', 'info');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to remove image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 py-7 sm:py-9">
      <div className="hela-shell">
        <p className="mb-2 text-xs font-semibold text-gray-400">Profile</p>

        <section className="bg-white px-5 py-8 shadow-[0_8px_22px_rgba(0,0,0,0.06)] sm:px-8 lg:px-14">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              {profile?.profilePicture?.url ? (
                <img src={profile.profilePicture.url} alt="Profile" className="h-32 w-32 rounded-full border-2 border-brand-dark object-cover" />
              ) : (
                <div className="grid h-32 w-32 place-items-center rounded-full border-2 border-brand-dark bg-brand-light/50">
                  <UserIcon className="h-12 w-12 text-brand-dark" />
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 grid place-items-center rounded-full bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              <div className="absolute bottom-1 right-1 flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="grid h-9 w-9 place-items-center rounded-full border-2 border-brand-dark bg-white text-brand-dark shadow-sm disabled:opacity-60"
                  title="Upload picture"
                >
                  <Camera className="h-4 w-4" />
                </button>
                {profile?.profilePicture?.url && (
                  <button
                    onClick={handleImageDelete}
                    disabled={uploadingImage}
                    className="grid h-9 w-9 place-items-center rounded-full border-2 border-red-200 bg-white text-red-600 shadow-sm disabled:opacity-60"
                    title="Remove picture"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-heading text-3xl font-black text-black sm:text-4xl">{profile?.name || 'Hela Eats User'}</h1>
                <span className="h-3 w-3 rounded-full bg-brand-light" />
                <span className="text-sm font-bold text-gray-500">Active User</span>
              </div>
              <p className="mt-1 text-sm font-black text-gray-500 underline underline-offset-2">{profile?.email}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-brand-dark/25 bg-white p-5 sm:p-6">
              <h2 className="mb-4 font-heading text-2xl font-black text-brand-dark">Personal Information</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold text-gray-700">
                  Name
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold outline-none transition-colors focus:border-brand focus:bg-white"
                  />
                </label>
                <label className="block text-sm font-bold text-gray-700">
                  Email
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="mt-1 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-500"
                  />
                </label>
                <label className="block text-sm font-bold text-gray-700">
                  Phone
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold outline-none transition-colors focus:border-brand focus:bg-white"
                    placeholder="+94 71 234 5678"
                  />
                </label>
                <div className="block text-sm font-bold text-gray-700">
                  Role
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-500">
                    <ShieldCheck className="h-4 w-4" /> {profile?.role || 'user'}
                  </div>
                </div>
              </div>
              <button onClick={handleSave} disabled={saving} className="hela-action mt-5 inline-flex items-center gap-2 px-6 py-2.5 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>

            <div className="rounded-xl border border-brand-dark/25 bg-brand-light/20 p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-black text-gray-900">
                  <Carrot className="h-5 w-5 text-brand" /> My Pantry
                </h2>
                <Link to="/pantry" className="text-sm font-bold text-brand hover:text-brand-dark">
                  Manage Pantry -&gt;
                </Link>
              </div>
              {profile?.pantry && profile.pantry.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.pantry.map((item, i) => {
                    const ingName = typeof item.ingredientId === 'object' ? item.ingredientId.name : 'Unknown';
                    return (
                      <span key={i} className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-800">
                        {ingName}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-400">Your pantry is empty. Add ingredients you already have at home to save on your next order!</p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-brand-dark/25 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-black text-gray-900">
                <MapPin className="h-5 w-5 text-brand" /> Addresses
              </h2>
              <button onClick={() => setShowAddressForm(!showAddressForm)} className="flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-dark">
                {showAddressForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showAddressForm ? 'Cancel' : 'Add'}
              </button>
            </div>

            {profile?.addresses && profile.addresses.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.addresses.map((addr, i) => (
                  <div key={i} className="rounded-xl border border-brand-dark/10 bg-brand-light/15 p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-full bg-brand-light/40 px-2 py-0.5 text-xs font-black text-brand">{addr.label}</span>
                      {addr.isDefault && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-600">Default</span>}
                    </div>
                    <p className="text-sm font-bold text-gray-700">{addr.fullName}</p>
                    <p className="text-xs font-semibold text-gray-500">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                      , {addr.city}
                      {addr.postalCode ? ` - ${addr.postalCode}` : ''}
                    </p>
                    {addr.phone && <p className="text-xs font-semibold text-gray-500">{addr.phone}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-semibold text-gray-400">No addresses saved yet.</p>
            )}

            {showAddressForm && (
              <div className="mt-4 rounded-xl border border-brand-light bg-brand-light/30 p-4">
                <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input type="text" value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)} placeholder="Label (defaults to Home)" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
                  <input type="text" value={addressFullName} onChange={(e) => setAddressFullName(e.target.value)} placeholder="Full Name *" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
                  <input type="text" value={addressPhone} onChange={(e) => setAddressPhone(e.target.value)} placeholder="Phone Number (optional)" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
                  <input type="text" value={addressZipcode} onChange={(e) => setAddressZipcode(e.target.value)} placeholder="Zipcode (optional)" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
                  <input type="text" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="City *" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm sm:col-span-2" />
                  <input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Address Line 1 *" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm sm:col-span-2" />
                  <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Address Line 2 (optional)" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm sm:col-span-2" />
                </div>
                <button onClick={handleAddAddress} disabled={saving} className="hela-action px-5 py-2 text-sm disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Address'}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
