import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, User, Shield } from "lucide-react";
import { User as UserType } from "@/types/user";

const RoleManagement: React.FC = () => {
  const { user } = useAuth();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;

  const [users, setUsers] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("Karyawan");

  // -------------------- Fetch Users --------------------
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  // -------------------- Fetch Role List -----------------
  const fetchRoles = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch roles");

      const data = await res.json();
      setRoles(data.roles);
    } catch (error) {
      console.error("Fetch roles error:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // -------------------- Access Restriction --------------------
  if (!["IT", "Admin", "Super Admin", "HR"].includes(user?.role || "")) {
    return (
      <div className="p-6 text-center">
        <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  // -------------------- Filter Users --------------------
  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterRole === "all" || u.role === filterRole)
  );

  // -------------------- Update Role Handler --------------------
  const handleUpdateRole = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      setEditingUserId(null);
      fetchUsers();
    } catch (error) {
      console.error("Update role error:", error);
    }
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Role Management</h1>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search by full name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select
          value={filterRole}
          onValueChange={(v) => setFilterRole(v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Roles</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-head">Full Name</th>
                  <th className="table-head">Username</th>
                  <th className="table-head">Email</th>
                  <th className="table-head">Role</th>
                  <th className="table-head text-center">Action</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="table-cell">{u.fullName}</td>
                    <td className="table-cell">{u.username}</td>
                    <td className="table-cell">{u.email}</td>

                    {/* ROLE SELECT / BADGE */}
                    <td className="table-cell">
                      {editingUserId === u.id ? (
                        <Select
                          value={selectedRole}
                          onValueChange={(v) => setSelectedRole(v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge>{u.role}</Badge>
                      )}
                    </td>

                    {/* ACTION BUTTONS */}
                    <td className="table-cell text-center">
                      {editingUserId === u.id ? (
                        <div className="flex justify-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateRole(u.id)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUserId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        ["Super Admin", "Admin"].includes(user.role) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUserId(u.id);
                              setSelectedRole(u.role || "Karyawan");
                            }}
                          >
                            Edit Role
                          </Button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagement;
