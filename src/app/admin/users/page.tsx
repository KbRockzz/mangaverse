"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Search, Plus } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination, Modal, LoadingScreen, EmptyState, Spinner } from "@/components/ui";
import { formatDate, getInitials } from "@/utils/helpers";
import type { DBUser } from "@/types";

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<DBUser | null>(null);
  
  // Add User Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("USER");

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", debouncedSearch, roleFilter, page],
    queryFn: () =>
      fetch(`/api/users?search=${debouncedSearch}&role=${roleFilter}&page=${page}&limit=15`).then((r) => r.json()),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.success) {
        addToast("success", "Role updated!");
        qc.invalidateQueries({ queryKey: ["admin-users"] });
      } else {
        addToast("error", data.error || "Failed to update role");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/users/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      addToast("success", "User deleted successfully");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteModal(null);
    },
  });

  const addUserMutation = useMutation({
    mutationFn: (userData: any) =>
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.success) {
        addToast("success", "User created successfully!");
        qc.invalidateQueries({ queryKey: ["admin-users"] });
        // Reset form
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("USER");
        setShowAddModal(false);
      } else {
        addToast("error", data.error || "Failed to create user");
      }
    },
  });

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      addToast("error", "Please fill in all fields");
      return;
    }
    addUserMutation.mutate({
      name: newName.trim(),
      email: newEmail.trim(),
      password: newPassword,
      role: newRole,
    });
  };

  const users: DBUser[] = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1>User Management</h1>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{total} total users</span>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="form-input"
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="form-input"
          style={{ maxWidth: 160 }}
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" message="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "var(--accent-color)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                            />
                          ) : (
                            getInitials(user.name)
                          )}
                        </div>
                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => updateRoleMutation.mutate({ id: user.id, role: e.target.value })}
                        className="form-input"
                        style={{ maxWidth: 120, padding: "0.3rem 0.6rem", fontSize: "0.85rem" }}
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{formatDate(user.createdAt)}</td>
                    <td>
                      <button className="btn-danger btn-sm" onClick={() => setDeleteModal(user)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={Math.ceil(total / 15)} onPageChange={setPage} />
        </>
      )}

      {/* ADD USER MODAL */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New User"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddUserSubmit} disabled={addUserMutation.isPending}>
              {addUserMutation.isPending ? <Spinner size="sm" /> : "Create User"}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddUserSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "0.5rem 0" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. John Doe"
              className="form-input"
              required
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className="form-input"
              required
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              required
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.85rem", fontWeight: 600 }}>Role</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="form-input">
              <option value="USER">User (Standard)</option>
              <option value="ADMIN">Admin (All Permissions)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete User"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
            <button
              className="btn-danger"
              onClick={() => deleteModal && deleteMutation.mutate(deleteModal.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Spinner size="sm" /> : "Delete"}
            </button>
          </>
        }
      >
        <p>Are you sure you want to permanently delete <strong>{deleteModal?.name}</strong> ({deleteModal?.email})?</p>
      </Modal>
    </div>
  );
}
