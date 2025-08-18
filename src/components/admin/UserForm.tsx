
"use client";

import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox"; 
import type { User, Role, CreateUserData } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppContext } from "@/context/AppContext";

const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters.").max(50),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  roles: z.array(z.string()).default([]), // Array of role IDs
  isActive: z.boolean().default(true),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If editing user and password is empty, skip validation
  if (!data.password && !data.confirmPassword) return true;
  
  // If password is provided, confirmPassword must match
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  
  // If one is provided but not the other, it's invalid
  return false;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User | null;
  roles: Role[]; 
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function UserForm({ user, roles: availableRoles, onSubmit, onCancel, isSubmitting }: UserFormProps) {
  const { getUIText } = useAppContext();
  



  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      password: "", 
      confirmPassword: "",
      roles: user?.roles || [],
      isActive: user?.isActive === undefined ? true : user.isActive,
    },
  });

  const handleSubmit = (data: UserFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">{getUIText("username")}</FormLabel>
              <FormControl><Input placeholder="Enter username" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">{getUIText("email")}</FormLabel>
              <FormControl><Input type="email" placeholder="user@example.com" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">{getUIText("password")}{user ? " (Leave blank to keep current)" : ""}</FormLabel>
              <FormControl><Input type="password" placeholder="••••••••" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Confirm Password {user && !form.getValues("password") ? "(Leave blank to keep current)" : ""}</FormLabel>
              <FormControl><Input type="password" placeholder="••••••••" {...field} className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="roles"
          render={() => (
            <FormItem>
              <FormLabel className="text-black">{getUIText("roles")}</FormLabel>
              <FormDescription className="text-black">Assign roles to this user.</FormDescription>
              <ScrollArea className="h-32 rounded-md border p-2">
                {availableRoles.map((role) => (
                  <FormField
                    key={role.id}
                    control={form.control}
                    name="roles"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(role.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), role.id])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== role.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal text-black">
                            {role.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                 {availableRoles.length === 0 && <p className="text-sm text-black p-2">No roles available. Create roles first.</p>}
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="text-black">{getUIText("userActive")}</FormLabel>
                <FormDescription className="text-black">
                  Set whether this user account is active.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="border-gray-200 text-black hover:bg-gray-50">
            {getUIText("cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : null}
            {isSubmitting ? (user ? "Saving..." : "Adding...") : (user ? getUIText("save") : getUIText("addUser"))}
          </Button>
        </div>
      </form>
    </Form>
  );
}
