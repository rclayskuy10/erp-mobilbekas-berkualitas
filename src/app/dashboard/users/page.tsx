'use client';

import { useState, Suspense } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import { useAuth, getRoleDisplayName, getRoleBadgeColor } from '@/contexts/AuthContext';
import { users as initialUsers } from '@/data/dummy';
import { formatDate, generateId } from '@/lib/utils';
import { User, UserRole } from '@/types';
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Users,
} from 'lucide-react';

function UsersContent() {
  const { hasPermission, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff' as UserRole,
    phone: '',
    isSalesPerson: false,
    salesTarget: 0,
    commissionRate: 0,
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Stats
  const activeUsers = users.filter((u) => u.isActive).length;
  const ownerCount = users.filter((u) => u.role === 'owner').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const staffCount = users.filter((u) => u.role === 'staff').length;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: generateId('user'),
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      createdAt: new Date().toISOString(),
      isActive: true,
      phone: formData.phone || undefined,
      isSalesPerson: formData.isSalesPerson,
      salesTarget: formData.isSalesPerson ? formData.salesTarget : undefined,
      commissionRate: formData.isSalesPerson ? formData.commissionRate : undefined,
      joinDate: new Date().toISOString(),
    };
    setUsers([newUser, ...users]);
    setIsAddModalOpen(false);
    setFormData({ name: '', email: '', password: '', role: 'staff', phone: '', isSalesPerson: false, salesTarget: 0, commissionRate: 0 });
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                password: formData.password || u.password,
                phone: formData.phone || undefined,
                isSalesPerson: formData.isSalesPerson,
                salesTarget: formData.isSalesPerson ? formData.salesTarget : undefined,
                commissionRate: formData.isSalesPerson ? formData.commissionRate : undefined,
              }
            : u
        )
      );
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', password: '', role: 'staff', phone: '', isSalesPerson: false, salesTarget: 0, commissionRate: 0 });
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleToggleActive = (user: User) => {
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, isActive: !u.isActive } : u
      )
    );
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      isSalesPerson: user.isSalesPerson || false,
      salesTarget: user.salesTarget || 0,
      commissionRate: user.commissionRate || 0,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  return (
    <ProtectedRoute requiredModule="users">
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
              <p className="text-gray-600">Kelola pengguna dan hak akses sistem</p>
            </div>
            {hasPermission('users', 'create') && (
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Tambah User
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total User</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="text-2xl font-bold text-purple-600">{ownerCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admin</p>
                  <p className="text-2xl font-bold text-blue-600">{adminCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Staff</p>
                  <p className="text-2xl font-bold text-green-600">{staffCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari nama atau email..."
              className="w-full"
            />
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sales Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dibuat
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-gray-400">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isSalesPerson ? (
                          <div className="space-y-1">
                            <Badge variant="info">Sales Person</Badge>
                            {user.salesTarget && (
                              <p className="text-xs text-gray-600">
                                Target: Rp {(user.salesTarget / 1000000).toFixed(0)}jt
                              </p>
                            )}
                            {user.commissionRate && (
                              <p className="text-xs text-gray-600">
                                Komisi: {user.commissionRate}%
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          {hasPermission('users', 'edit') && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleActive(user)}
                                title={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                              >
                                {user.isActive ? (
                                  <UserX className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {hasPermission('users', 'delete') &&
                            user.id !== currentUser?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteModal(user)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Tidak ada user ditemukan</p>
              </div>
            )}
          </div>

          {/* Role Permissions Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hak Akses Berdasarkan Role
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                      Modul
                    </th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-purple-600">
                      Owner
                    </th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-blue-600">
                      Admin
                    </th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-green-600">
                      Staff
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Dashboard</td>
                    <td className="py-3 px-4 text-center">✅ Full</td>
                    <td className="py-3 px-4 text-center">👁️ View</td>
                    <td className="py-3 px-4 text-center">👁️ View</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Inventory</td>
                    <td className="py-3 px-4 text-center">✅ Full</td>
                    <td className="py-3 px-4 text-center">✏️ Edit</td>
                    <td className="py-3 px-4 text-center">➕ Create</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">GRN</td>
                    <td className="py-3 px-4 text-center">✅ Full</td>
                    <td className="py-3 px-4 text-center">✏️ Edit</td>
                    <td className="py-3 px-4 text-center">➕ Create</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Penjualan</td>
                    <td className="py-3 px-4 text-center">✅ Full</td>
                    <td className="py-3 px-4 text-center">✏️ Edit</td>
                    <td className="py-3 px-4 text-center">➕ Create</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Laporan</td>
                    <td className="py-3 px-4 text-center">✅ Full</td>
                    <td className="py-3 px-4 text-center">👁️ View</td>
                    <td className="py-3 px-4 text-center">❌ None</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Manajemen User</td>
                    <td className="py-3 px-4 text-center">✅ Full</td>
                    <td className="py-3 px-4 text-center">👁️ View</td>
                    <td className="py-3 px-4 text-center">❌ None</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add User Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Tambah User Baru"
          size="md"
        >
          <form onSubmit={handleAddUser} className="space-y-4">
            <Input
              label="Nama Lengkap"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              options={[
                { value: 'owner', label: 'Owner' },
                { value: 'admin', label: 'Admin' },
                { value: 'staff', label: 'Staff' },
              ]}
            />
            <Input
              label="No. Telepon"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="08123456789"
            />
            
            {/* Sales Person Toggle */}
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSalesPerson}
                  onChange={(e) => setFormData({ ...formData, isSalesPerson: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Jadikan Sales Person
                </span>
              </label>
            </div>

            {/* Sales Fields - Only show if isSalesPerson is checked */}
            {formData.isSalesPerson && (
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900">Pengaturan Sales</h3>
                <Input
                  label="Target Penjualan (per bulan)"
                  type="number"
                  value={formData.salesTarget}
                  onChange={(e) => setFormData({ ...formData, salesTarget: Number(e.target.value) })}
                  placeholder="500000000"
                  helperText="Dalam Rupiah, contoh: 500000000 = 500 juta"
                />
                <Input
                  label="Persentase Komisi (%)"
                  type="number"
                  step="0.1"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                  placeholder="2.5"
                  helperText="Contoh: 2.5 untuk komisi 2.5%"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setIsAddModalOpen(false)}
                type="button"
              >
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit User"
          size="md"
        >
          <form onSubmit={handleEditUser} className="space-y-4">
            <Input
              label="Nama Lengkap"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Password Baru"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              helperText="Kosongkan jika tidak ingin mengubah password"
            />
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              options={[
                { value: 'owner', label: 'Owner' },
                { value: 'admin', label: 'Admin' },
                { value: 'staff', label: 'Staff' },
              ]}
            />
            <Input
              label="No. Telepon"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="08123456789"
            />
            
            {/* Sales Person Toggle */}
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSalesPerson}
                  onChange={(e) => setFormData({ ...formData, isSalesPerson: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Jadikan Sales Person
                </span>
              </label>
            </div>

            {/* Sales Fields - Only show if isSalesPerson is checked */}
            {formData.isSalesPerson && (
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900">Pengaturan Sales</h3>
                <Input
                  label="Target Penjualan (per bulan)"
                  type="number"
                  value={formData.salesTarget}
                  onChange={(e) => setFormData({ ...formData, salesTarget: Number(e.target.value) })}
                  placeholder="500000000"
                  helperText="Dalam Rupiah, contoh: 500000000 = 500 juta"
                />
                <Input
                  label="Persentase Komisi (%)"
                  type="number"
                  step="0.1"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                  placeholder="2.5"
                  helperText="Contoh: 2.5 untuk komisi 2.5%"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
                type="button"
              >
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Hapus User"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin menghapus user{' '}
              <span className="font-semibold">{selectedUser?.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteUser}>
                Hapus
              </Button>
            </div>
          </div>
        </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <UsersContent />
    </Suspense>
  );
}
