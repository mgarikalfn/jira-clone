// components/user/ProfileModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader, User, Mail, Key, Eye, EyeOff } from "lucide-react";

const nameSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
});

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required for email change"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

type NameFormData = z.infer<typeof nameSchema>;
type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
  };
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState("name");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const nameForm = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: user.name,
    },
  });

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user.email,
      password: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const handleNameUpdate = async (data: NameFormData) => {
    setIsLoading(true);
    try {
     const response = await fetch("/api/user/profile/name", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      window.location.reload(); // Refresh to show new name
    } catch (error: any) {
      nameForm.setError("name", { message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailUpdate = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
     const response = await fetch("/api/user/profile/email", {
  method: "PATCH", 
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      alert("Email updated! Please check your email for verification.");
      onClose();
    } catch (error: any) {
      emailForm.setError("root", { message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile/password", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      alert("Password updated successfully!");
      passwordForm.reset();
      setActiveTab("name");
    } catch (error: any) {
      passwordForm.setError("root", { message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    nameForm.reset();
    emailForm.reset();
    passwordForm.reset();
    setActiveTab("name");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="name">Name</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          {/* Name Tab */}
          <TabsContent value="name">
            <form onSubmit={nameForm.handleSubmit(handleNameUpdate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...nameForm.register("name")}
                  placeholder="Your name"
                  className={nameForm.formState.errors.name ? "border-red-500" : ""}
                />
                {nameForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{nameForm.formState.errors.name.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Update Name
              </Button>
            </form>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <form onSubmit={emailForm.handleSubmit(handleEmailUpdate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">New Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...emailForm.register("email")}
                  placeholder="new@email.com"
                  className={emailForm.formState.errors.email ? "border-red-500" : ""}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-password">Current Password</Label>
                <Input
                  id="email-password"
                  type="password"
                  {...emailForm.register("password")}
                  className={emailForm.formState.errors.password ? "border-red-500" : ""}
                />
                {emailForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{emailForm.formState.errors.password.message}</p>
                )}
              </div>

              {emailForm.formState.errors.root && (
                <p className="text-sm text-red-500">{emailForm.formState.errors.root.message}</p>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Update Email
              </Button>
            </form>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    {...passwordForm.register("currentPassword")}
                    className={passwordForm.formState.errors.currentPassword ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    {...passwordForm.register("newPassword")}
                    className={passwordForm.formState.errors.newPassword ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              {passwordForm.formState.errors.root && (
                <p className="text-sm text-red-500">{passwordForm.formState.errors.root.message}</p>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                Update Password
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}