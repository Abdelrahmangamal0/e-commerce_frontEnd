import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api/auth.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { User, Camera, Lock } from 'lucide-react';
import { URL_Base } from '../admin/UsersPage';

const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>;

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: authApi.updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully');
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update password');
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: authApi.updateProfileImage,
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile image updated');
      setIsUploadingImage(false);
    },
    onError: () => {
      toast.error('Failed to update profile image');
      setIsUploadingImage(false);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploadingImage(true);
    updateImageMutation.mutate(file);
  };

  const onSubmitPassword = (data: UpdatePasswordForm) => {
    updatePasswordMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="p-8 text-gray-500 dark:text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 text-gray-900 dark:text-gray-100">

      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {/* Profile Info */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
        
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </h2>

        <div className="flex gap-6">
          
          {/* Image */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              {user.profilePicture ? (
                <img
                  src={`${URL_Base}/${user.profilePicture}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-full h-full p-4 text-gray-400" />
              )}
            </div>

            <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer">
              <Camera className="h-4 w-4" />
              <input type="file" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-4 flex-1">

            {[
              { label: 'First Name', value: user.firstName },
              { label: 'Last Name', value: user.lastName },
              { label: 'Email', value: user.email },
              { label: 'Phone', value: user.phone },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  {field.label}
                </label>
                <input
                  value={field.value}
                  disabled
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700"
                />
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">

        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </h2>

        <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">

          {["oldPassword", "newPassword", "confirmPassword"].map((field, ) => (
            <div key={field}>
              <input
                {...register(field as any)}
                type="password"
                placeholder={field}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700"
              />
              {errors[field as keyof typeof errors] && (
                <p className="text-red-500 text-sm">
                  {errors[field as keyof typeof errors]?.message}
                </p>
              )}
            </div>
          ))}

          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg">
            Update Password
          </button>

        </form>
      </div>
    </div>
  );
};