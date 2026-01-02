
// import React, { useState } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import FaceVerification from './FaceVerification';
// import { User, UserCheck } from 'lucide-react';


// const ProfilePage: React.FC = () => {
//   const { user } = useAuth();
//   const [isEditing, setIsEditing] = useState(false);
//   const [profileData, setProfileData] = useState({
//     fullName: user?.fullName || '',
//     email: user?.email || '',
//     username: user?.username || ''
//   });

//   const handleSave = () => {
//     setIsEditing(false);
//     // Here you would typically save to your backend
//     console.log('Saving profile data:', profileData);
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
//         <p className="text-gray-600 mt-1">Manage your account and verification settings</p>
//       </div>

//       <Tabs defaultValue="profile" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="profile" className="flex items-center space-x-2">
//             <User className="h-4 w-4" />
//             <span>Profile Information</span>
//           </TabsTrigger>
//           <TabsTrigger value="verification" className="flex items-center space-x-2">
//             <UserCheck className="h-4 w-4" />
//             <span>Face Verification</span>
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="profile">
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle>Personal Information</CardTitle>
//                 <Button
//                   variant={isEditing ? "default" : "outline"}
//                   onClick={() => isEditing ? handleSave() : setIsEditing(true)}
//                 >
//                   {isEditing ? 'Save Changes' : 'Edit Profile'}
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="fullName">Full Name</Label>
//                   <Input
//                     id="fullName"
//                     value={profileData.fullName}
//                     onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
//                     disabled={!isEditing}
//                     className="h-11"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="username">Username</Label>
//                   <Input
//                     id="username"
//                     value={profileData.username}
//                     onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
//                     disabled={!isEditing}
//                     className="h-11"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={profileData.email}
//                     onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
//                     disabled={!isEditing}
//                     className="h-11"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="role">Role</Label>
//                   <Input
//                     id="role"
//                     value={user?.role || ''}
//                     disabled
//                     className="h-11 bg-gray-50"
//                   />
//                 </div>
//               </div>

//               <div className="pt-4 border-t">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="font-medium text-gray-900">Account Status</h3>
//                     <p className="text-sm text-gray-600">Your account approval status</p>
//                   </div>
//                   <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//                     user?.isApproved 
//                       ? 'bg-green-100 text-green-800' 
//                       : 'bg-yellow-100 text-yellow-800'
//                   }`}>
//                     {user?.isApproved ? 'Approved' : 'Pending Approval'}
//                   </div>
//                 </div>
//               </div>

//               <div className="pt-4 border-t">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="font-medium text-gray-900">Face Verification</h3>
//                     <p className="text-sm text-gray-600">Required for attendance check-in</p>
//                   </div>
//                   <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//                     user?.faceVerified
//                       ? 'bg-green-100 text-green-800' 
//                       : 'bg-red-100 text-red-800'
//                   }`}>
//                     {user?.faceVerified ? 'Verified' : 'Not Verified'}
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="verification">
//           <FaceVerification />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default ProfilePage;

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FaceVerification from './FaceVerification';
import { User, UserCheck, KeyRound } from 'lucide-react';
import { title } from 'process';
import { Description } from '@radix-ui/react-toast';
import { useToast } from '@/hooks/use-toast';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = () => {
    setIsEditing(false);
    console.log('Saving profile data:', profileData);
  };

  const { changePassword } = useAuth();

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match.",
        variant: "destructive"
    });
      return;
    }

    const res = await changePassword(passwordData.oldPassword, passwordData.newPassword);

    if (res.success) {
      toast({
        title: "Change Password Successful",
        description: "Password updated successfully."
    });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast({
        title: "Change Password Failed",
        description: "Failed to update password.",
        variant: "destructive"
    });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and verification settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center space-x-2">
            <KeyRound className="h-4 w-4" />
            <span>Password</span>
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Face Verification</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={user?.role || ''}
                    disabled
                    className="h-11 bg-gray-50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Account Status</h3>
                    <p className="text-sm text-gray-600">Your account approval status</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${user?.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {user?.isApproved ? 'Approved' : 'Pending Approval'}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Face Verification</h3>
                    <p className="text-sm text-gray-600">Required for attendance check-in</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${user?.faceVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user?.faceVerified ? 'Verified' : 'Not Verified'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  type="password"
                  id="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="h-11"
                />
              </div>

              <Button className="w-full h-11 mt-4" onClick={handlePasswordChange}>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <FaceVerification />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
