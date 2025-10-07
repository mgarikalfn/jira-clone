"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Client, Account } from 'node-appwrite';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { Button } from "@/components/ui/button";

import { useLogout } from "../api/use-logout";
import { useCurrent } from "../api/use-current";
import { Loader, LogOut, User, Settings, Key, Edit } from "lucide-react";
import { ProfileModal } from "@/components/profile-modal";

export const UserButton = () => {
  const { data: user, isLoading } = useCurrent();
  const { mutate: logout } = useLogout();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  if (isLoading) {
    return (
      <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
        <Loader className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { name, email } = user;

  const avatarFallback = name
    ? name.charAt(0).toUpperCase()
    : email?.charAt(0).toUpperCase() ?? "U";

  const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68b5e4a9003ce7020d2b');

  const account = new Account(client);

  const handleForgotPassword = async (userEmail: string) => {
    try {
      const response = await account.createRecovery(
        userEmail,
        `${window.location.origin}/auth/reset-password`
      );
      
      console.log('Password reset email sent successfully');
      alert('Password reset instructions have been sent to your email.');
      setIsPasswordDialogOpen(false);
      
    } catch (error) {
      console.error('Error sending reset email:', error);
      alert('Failed to send reset email. Please check your email address.');
    }
  };

  const handleResetPasswordClick = () => {
    // Pre-fill with user's email if available
    setResetEmail(email || "");
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEmail) {
      handleForgotPassword(resetEmail);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="outline-none relative">
          <Avatar className="size-10 hover:opacity-75 transition border-neutral-300">
            <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          className="w-64"
          sideOffset={10}
        >
          {/* User Info Section */}
          <div className="flex flex-col items-center gap-2 px-2.5 py-4">
            <Avatar className="size-[52px] border border-neutral-300">
              <AvatarFallback className="bg-neutral-200 text-xl font-medium text-neutral-500 flex items-center justify-center">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-neutral-900">
                {name || "User"}
              </p>
              <p className="text-xs text-neutral-600 truncate max-w-[200px]">
                {email}
              </p>
            </div>
          </div>

          <DottedSeparator className="mb-1" />

          {/* Profile Actions */}
          <DropdownMenuItem 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 rounded-md"
          >
            <Edit className="w-4 h-4 mr-2 text-blue-600" />
            Edit Profile
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={handleResetPasswordClick}
            className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 rounded-md"
          >
            <Key className="w-4 h-4 mr-2 text-amber-600" />
            Reset Password
          </DropdownMenuItem>

          <DottedSeparator className="my-1" />

          {/* Logout */}
          <DropdownMenuItem 
            onClick={() => logout()}
            className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 rounded-md text-red-600 font-medium"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={{ name: name || "", email: email || "" }}
      />

      {/* Password Reset Dialog */}
      {isPasswordDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            <form onSubmit={handlePasswordDialogSubmit}>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border rounded mb-4 text-sm"
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsPasswordDialogOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};