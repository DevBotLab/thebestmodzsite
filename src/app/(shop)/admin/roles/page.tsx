'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Plus, Edit3, Trash2, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StarLoader } from '@/components/ui/StarLoader'

interface Role {
  id: string
  name: string
  permissions: string[]
  _count: { users: number }
}

const allPermissions = [
  'products.manage', 'products.view',
  'categories.manage', 'categories.view',
  'orders.manage', 'orders.view',
  'users.manage', 'users.view',
  'tickets.manage', 'tickets.view',
  'cheats.manage', 'cheats.view',
  'news.manage', 'news.view',
  'banners.manage', 'banners.view',
  'payments.manage', 'payments.view',
  'referrals.manage', 'referrals.view',
  'settings.manage', 'settings.view',
  'roles.manage', 'roles.view',
  'logs.view',
  'pages.manage', 'pages.view',
]

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [form, setForm] = useState({ name: '', permissions: [] as string[] })

  const load = () => {
    setLoading(true)
    fetch('/api/admin/roles')
      .then(r => r.json())
      .then(res => {
        if (res.success) setRoles(res.data)
        else toast.error(res.error || 'Ошибка')
      })
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const togglePermission = (perm: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }))
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', permissions: [] })
    setShowModal(true)
  }

  const openEdit = (role: Role) => {
    setEditing(role)
    setForm({ name: role.name, permissions: role.permissions })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name) { toast.error('Введите название'); return }
    const url = editing ? `/api/admin/roles/${editing.id}` : '/api/admin/roles'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(editing ? 'Сохранено' : 'Создано')
      setShowModal(false)
      load()
    } else toast.error(data.error || 'Ошибка')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить роль?')) return
    const res = await fetch(`/api/admin/roles/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) { toast.success('Удалено'); load() }
    else toast.error(data.error || 'Ошибка')
  }

  if (loading) return <div className="flex justify-center py-20"><StarLoader /></div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Создать роль
        </button>
      </div>

      <GlassCard className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/5">
              <th className="text-left py-3 px-4">Название</th>
              <th className="text-left py-3 px-4">Права</th>
              <th className="text-center py-3 px-4">Пользователей</th>
              <th className="w-20 py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-white/5 hover:bg-dark-200">
                <td className="py-3 px-4 text-white font-medium">{role.name}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((p) => (
                      <span key={p} className="bg-purple-400/10 text-purple-400 px-1.5 py-0.5 rounded text-xs">{p}</span>
                    ))}
                    {role.permissions.length === 0 && <span className="text-gray-500">—</span>}
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-gray-300">{role._count.users}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(role)} className="text-blue-400 hover:text-blue-300 p-1">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(role.id)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr><td colSpan={4} className="py-10 text-center text-gray-500">Нет ролей</td></tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{editing ? 'Редактировать' : 'Создать'} роль</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Название роли" className="w-full bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <div>
                <p className="text-xs text-gray-400 mb-2">Права доступа:</p>
                <div className="grid grid-cols-2 gap-2">
                  {allPermissions.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="rounded"
                      />
                      {perm}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Отмена</button>
              <button onClick={handleSave} className="btn-primary text-sm">{editing ? 'Сохранить' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
