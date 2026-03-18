import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MapPin, Plus, Trash2, User as UserIcon } from 'lucide-react';
import { UserAddress } from '@/types';
import { cn } from '@/lib/utils';

const ProfilePage = () => {
    const { t } = useTranslation();
    const { user, updateUserProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phoneNumber ? (user.phoneNumber.length > 10 ? user.phoneNumber.slice(-10) : user.phoneNumber) : '',
        password: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Address State
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [editAddressId, setEditAddressId] = useState<string | null>(null);
    const [newAddress, setNewAddress] = useState<Partial<UserAddress>>({
        type: 'Home',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false
    });

    // Synchronize profile data when user object is loaded/updated
    React.useEffect(() => {
        if (user && !isEditingProfile) {
            setProfileData(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phoneNumber ? (user.phoneNumber.length > 10 ? user.phoneNumber.slice(-10) : user.phoneNumber) : '',
            }));
        }
    }, [user, isEditingProfile]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
                toast.error("New passwords do not match");
                setIsLoading(false);
                return;
            }

            const updatePayload: any = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                phoneNumber: profileData.phone // Remapping phone to phoneNumber for backend
            };

            if (profileData.newPassword) {
                updatePayload.password = profileData.newPassword;
                updatePayload.currentPassword = profileData.currentPassword;
            }

            await updateUserProfile(updatePayload);
            toast.success("Profile updated successfully");
            setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
            setIsEditingProfile(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEditAddress = (address: UserAddress) => {
        setEditAddressId(address._id || null);
        setNewAddress({
            type: address.type,
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault
        });
        setIsAddressDialogOpen(true);
    };

    const handleOpenAddAddress = () => {
        setEditAddressId(null);
        setNewAddress({ type: 'Home', street: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
        setIsAddressDialogOpen(true);
    };

    const handleSaveAddress = async () => {
        setIsLoading(true);
        try {
            if (editAddressId) {
                await updateAddress(editAddressId, newAddress);
                toast.success("Address updated successfully");
            } else {
                await addAddress(newAddress);
                toast.success("Address added successfully");
            }
            setIsAddressDialogOpen(false);
            setEditAddressId(null);
            setNewAddress({ type: 'Home', street: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
        } catch (error: any) {
            toast.error(error.message || "Failed to save address");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAddress = async (id: string | undefined) => {
        if (!id) return;
        if (!confirm("Are you sure you want to remove this address?")) return;
        setIsLoading(true);
        try {
            await deleteAddress(id);
            toast.success("Address removed successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove address");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetDefaultAddress = async (id: string | undefined) => {
        if (!id) return;
        setIsLoading(true);
        try {
            await setDefaultAddress(id);
            toast.success("Default address updated");
        } catch (error: any) {
            toast.error(error.message || "Failed to set default address");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold font-playfair mb-8">{t('profile.title')}</h1>

            <Tabs defaultValue="profile" className="w-full max-w-4xl mx-auto">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="profile" className="gap-2">
                        <UserIcon className="h-4 w-4" /> {t('header.my_profile')}
                    </TabsTrigger>
                    <TabsTrigger value="addresses" className="gap-2">
                        <MapPin className="h-4 w-4" /> {t('profile.addresses.title')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Update your personal details and password.</CardDescription>
                            </div>
                            {!isEditingProfile && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditingProfile(true)}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4 rotate-45" /> Edit Profile
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={profileData.firstName}
                                            onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                                            required
                                            disabled={!isEditingProfile}
                                            className={cn(!isEditingProfile && "bg-secondary/30 border-transparent cursor-default")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={profileData.lastName}
                                            onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                                            required
                                            disabled={!isEditingProfile}
                                            className={cn(!isEditingProfile && "bg-secondary/30 border-transparent cursor-default")}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileData.email}
                                            onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                            required
                                            disabled={!isEditingProfile}
                                            className={cn(!isEditingProfile && "bg-secondary/30 border-transparent cursor-default")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-muted-foreground text-sm font-medium select-none pointer-events-none">+91</span>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                inputMode="numeric"
                                                pattern="[0-9]{10}"
                                                maxLength={10}
                                                value={profileData.phone}
                                                onKeyDown={(e) => {
                                                    if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                                                }}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                                    setProfileData({ ...profileData, phone: val });
                                                }}
                                                placeholder="9876543210"
                                                className={cn("pl-10", !isEditingProfile && "bg-secondary/30 border-transparent cursor-default")}
                                                disabled={!isEditingProfile}
                                            />
                                        </div>
                                        {isEditingProfile && <p className="text-[10px] text-muted-foreground italic">10 digits only</p>}
                                    </div>
                                </div>

                                {isEditingProfile && (
                                    <div className="space-y-4 pt-4 border-t border-border animate-fade-in">
                                        <h3 className="text-lg font-medium">Change Password</h3>
                                        <div className="space-y-2 max-w-md">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <Input
                                                id="currentPassword"
                                                type="password"
                                                value={profileData.currentPassword}
                                                onChange={e => setProfileData({ ...profileData, currentPassword: e.target.value })}
                                                placeholder="Required to change password"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">New Password</Label>
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    value={profileData.newPassword}
                                                    onChange={e => setProfileData({ ...profileData, newPassword: e.target.value })}
                                                    autoComplete="new-password"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={profileData.confirmPassword}
                                                    onChange={e => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                                                    autoComplete="new-password"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isEditingProfile && (
                                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditingProfile(false);
                                                setProfileData({
                                                    ...profileData,
                                                    firstName: user?.firstName || '',
                                                    lastName: user?.lastName || '',
                                                    email: user?.email || '',
                                                    phone: user?.phoneNumber || ''
                                                });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="addresses">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Saved Addresses</CardTitle>
                                <CardDescription>Manage your shipping addresses.</CardDescription>
                            </div>
                            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="gap-2" onClick={handleOpenAddAddress}>
                                        <Plus className="h-4 w-4" /> {t('profile.addresses.add_button')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>{editAddressId ? t('profile.addresses.edit_title') : t('profile.addresses.add_title')}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>{t('profile.addresses.type')}</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Home', 'Work', 'Billing', 'Shipping', 'Other'].map((type) => (
                                                    <Button
                                                        key={type}
                                                        type="button"
                                                        size="sm"
                                                        variant={newAddress.type === type ? 'default' : 'outline'}
                                                        onClick={() => setNewAddress({ ...newAddress, type: type as any })}
                                                    >
                                                        {t(`profile.addresses.types.${type}`)}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('profile.addresses.street')}</Label>
                                            <Input
                                                value={newAddress.street}
                                                onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                                                placeholder="123 Main St"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>{t('profile.addresses.city')}</Label>
                                                <Input
                                                    value={newAddress.city}
                                                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t('profile.addresses.state')}</Label>
                                                <Input
                                                    value={newAddress.state}
                                                    onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>{t('profile.addresses.postal_code')}</Label>
                                                <Input
                                                    value={newAddress.postalCode}
                                                    onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t('profile.addresses.country')}</Label>
                                                <Input
                                                    value={newAddress.country}
                                                    onChange={e => setNewAddress({ ...newAddress, country: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="isDefault"
                                                checked={newAddress.isDefault}
                                                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <Label htmlFor="isDefault" className="cursor-pointer">{t('profile.addresses.set_default')}</Label>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>{t('profile.addresses.cancel')}</Button>
                                        <Button onClick={handleSaveAddress} disabled={isLoading}>
                                            {isLoading ? t('profile.addresses.saving') : (editAddressId ? t('profile.addresses.update_button') : t('profile.addresses.save_button'))}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-6">
                                {t('profile.addresses.description')}
                            </p>

                            {!user?.addresses || user.addresses.length === 0 ? (
                                <div className="text-center py-12 bg-secondary/5 rounded-xl border-2 border-dashed border-border">
                                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                                    <p className="text-muted-foreground">{t('profile.addresses.empty')}</p>
                                    <Button variant="link" onClick={handleOpenAddAddress} className="mt-2 text-primary">
                                        {t('profile.addresses.add_first')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {user.addresses.map((address) => (
                                        <Card key={address._id} className={cn(
                                            "relative group overflow-hidden transition-all hover:shadow-md",
                                            address.isDefault && "border-primary/50 bg-primary/5"
                                        )}>
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground">
                                                            {t(`profile.addresses.types.${address.type}`)}
                                                        </span>
                                                        {address.isDefault && (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground">
                                                                {t('profile.addresses.default_badge')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                            onClick={() => handleOpenEditAddress(address)}
                                                        >
                                                            <Plus className="h-4 w-4 rotate-45" />
                                                            <span className="sr-only">{t('profile.addresses.actions.edit')}</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeleteAddress(address._id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">{t('profile.addresses.actions.delete')}</span>
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="font-semibold text-foreground">{address.street}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {address.city}, {address.state} - {address.postalCode}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{address.country}</p>
                                                </div>

                                                {!address.isDefault && (
                                                    <Button
                                                        variant="link"
                                                        className="p-0 h-auto mt-4 text-xs font-semibold text-primary hover:no-underline"
                                                        onClick={() => handleSetDefaultAddress(address._id)}
                                                    >
                                                        {t('profile.addresses.actions.set_as_default')}
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProfilePage;
