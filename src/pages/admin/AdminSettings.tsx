import React, { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import {
    Settings,
    Plus,
    Pencil,
    Trash2,
    Shield,
    UserPlus,
    Mail,
    Phone,
    Users
} from "lucide-react";

const AdminSettings = () => {
    const { user: currentUser } = useStore();
    const [admins, setAdmins] = useState<any[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

    const [newAdmin, setNewAdmin] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: ''
    });

    const fetchAdmins = async () => {
        try {
            if ((currentUser as any).token) {
                const data = await api.getAdmins((currentUser as any).token);
                setAdmins(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, [currentUser]);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createUser({
                ...newAdmin,
                phoneNumber: newAdmin.phone,
                role: 'admin'
            }, (currentUser as any).token);

            toast.success("Admin added successfully");
            setIsAddOpen(false);
            setNewAdmin({ firstName: '', lastName: '', email: '', password: '', phone: '' });
            fetchAdmins();
        } catch (e: any) {
            toast.error(e.message || "Failed to add admin");
        }
    };

    const handleEditAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin) return;
        try {
            await api.updateUser(selectedAdmin._id, selectedAdmin, (currentUser as any).token);
            toast.success("Admin updated successfully");
            setIsEditOpen(false);
            fetchAdmins();
        } catch (e: any) {
            toast.error(e.message || "Failed to update admin");
        }
    };

    const handleDeleteAdmin = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this admin?")) return;
        try {
            await api.deleteUser(id, (currentUser as any).token);
            toast.success("Admin removed successfully");
            fetchAdmins();
        } catch (e: any) {
            toast.error(e.message || "Failed to remove admin");
        }
    };

    const openEdit = (admin: any) => {
        setSelectedAdmin({ ...admin, password: '' });
        setIsEditOpen(true);
    };

    return (
        <div className="p-6 lg:p-8 bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                            <Settings className="h-5 w-5 text-white" />
                        </div>
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage admin users and access control</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2 shadow-md rounded-xl self-start sm:self-auto">
                    <UserPlus className="h-4 w-4" /> Add Admin
                </Button>
            </div>

            {/* Admin Count Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Total Admins</span>
                    </div>
                    <p className="text-2xl font-extrabold">{admins.length}</p>
                </div>
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Access Level</span>
                    </div>
                    <p className="text-2xl font-extrabold">Full Control</p>
                </div>
            </div>

            {/* Admin Users Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-base">Admin Users</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">People with admin access to this panel</p>
                    </div>
                </div>

                <div className="divide-y divide-border">
                    {admins.map((admin) => (
                        <div key={admin._id} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-primary">
                                        {(admin.firstName?.[0] || '?').toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{admin.firstName} {admin.lastName}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Mail className="h-3 w-3" /> {admin.email}
                                        </span>
                                        {admin.phoneNumber && (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {admin.phoneNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[11px] font-semibold bg-primary/5 text-primary border-primary/20">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {admin.role}
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(admin)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                {admin._id !== currentUser?.id && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAdmin(admin._id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {admins.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                            <Users className="h-7 w-7 text-muted-foreground/40" />
                        </div>
                        <h3 className="font-semibold text-lg text-muted-foreground">No admin users</h3>
                        <p className="text-sm text-muted-foreground mt-1">Add your first admin to get started</p>
                    </div>
                )}
            </div>

            {/* Add Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <UserPlus className="h-4 w-4 text-primary" />
                            </div>
                            Add New Admin
                        </DialogTitle>
                        <DialogDescription>Create a new administrator account with full access.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddAdmin} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">First Name</Label>
                                <Input className="rounded-xl h-10" value={newAdmin.firstName} onChange={e => setNewAdmin({ ...newAdmin, firstName: e.target.value })} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Name</Label>
                                <Input className="rounded-xl h-10" value={newAdmin.lastName} onChange={e => setNewAdmin({ ...newAdmin, lastName: e.target.value })} required />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
                            <Input className="rounded-xl h-10" type="email" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</Label>
                            <Input className="rounded-xl h-10" type="password" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone</Label>
                            <Input className="rounded-xl h-10" value={newAdmin.phone} onChange={e => setNewAdmin({ ...newAdmin, phone: e.target.value })} required />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button type="submit" className="rounded-xl gap-2 shadow-md">
                                <Plus className="h-4 w-4" /> Create Admin
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Pencil className="h-4 w-4 text-primary" />
                            </div>
                            Edit Admin
                        </DialogTitle>
                    </DialogHeader>
                    {selectedAdmin && (
                        <form onSubmit={handleEditAdmin} className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">First Name</Label>
                                    <Input className="rounded-xl h-10" value={selectedAdmin.firstName} onChange={e => setSelectedAdmin({ ...selectedAdmin, firstName: e.target.value })} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Name</Label>
                                    <Input className="rounded-xl h-10" value={selectedAdmin.lastName} onChange={e => setSelectedAdmin({ ...selectedAdmin, lastName: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
                                <Input className="rounded-xl h-10" type="email" value={selectedAdmin.email} onChange={e => setSelectedAdmin({ ...selectedAdmin, email: e.target.value })} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</Label>
                                <Input className="rounded-xl h-10" type="password" placeholder="Leave blank to keep current" value={selectedAdmin.password || ''} onChange={e => setSelectedAdmin({ ...selectedAdmin, password: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone</Label>
                                <Input className="rounded-xl h-10" value={selectedAdmin.phoneNumber || ''} onChange={e => setSelectedAdmin({ ...selectedAdmin, phoneNumber: e.target.value })} />
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                                <Button type="submit" className="rounded-xl gap-2 shadow-md">Update Admin</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminSettings;
