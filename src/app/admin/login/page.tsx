
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction } from "@/app/admin/auth/actions";
import type { LoginFormData } from "@/lib/types";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { checkServerVarsAction } from "@/app/admin/auth/actions";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<LoginFormData>({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverConfigError, setServerConfigError] = useState<string | null>(null);
  const [serverVars, setServerVars] = useState<Record<string, string | boolean> | null>(null);
  const [isCheckingVars, setIsCheckingVars] = useState(false);

  useEffect(() => {
    const configErrorParam = searchParams.get('configError');
    if (configErrorParam) {
        setServerConfigError(decodeURIComponent(configErrorParam));
    }
    const generalErrorParam = searchParams.get('error');
     if (generalErrorParam) {
        setError(decodeURIComponent(generalErrorParam));
    }
  }, [searchParams]);

  const handleCheckServerVars = async () => {
    setIsCheckingVars(true);
    setError(null);
    setServerConfigError(null);
    try {
        const vars = await checkServerVarsAction();
        setServerVars(vars);
    } catch (e: any) {
        setError("Failed to check server configuration: " + e.message);
        setServerVars(null);
    } finally {
        setIsCheckingVars(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setServerConfigError(null); // Clear previous server config errors on new attempt
    console.log("LoginPage: handleSubmit invoked for user:", formData.username);

    try {
      // loginAction will throw NEXT_REDIRECT on success if using redirect() from next/navigation
      const result = await loginAction(formData); 
      
      // This part should ideally not be reached if redirect() in loginAction works,
      // as it throws NEXT_REDIRECT. If it is reached, it means loginAction
      // returned an object, indicating a failure or an unexpected flow.
      console.log("LoginPage: loginAction result (if it didn't throw NEXT_REDIRECT):", result);

      if (result && !result.success && result.error) {
        console.error("LoginPage: loginAction returned error:", result.error);
        setError(result.error);
      } else if (result && result.success) {
        // This is an unexpected state if loginAction is supposed to redirect server-side.
        console.warn("LoginPage: loginAction returned success but did not throw NEXT_REDIRECT. This is unexpected if redirect() was called.");
        // Attempt client-side redirect as a fallback if server redirect signal wasn't caught
        if (result.redirectPath) { // redirectPath might not exist on success if redirect() was used
            console.log("LoginPage: Fallback client-side redirect to:", result.redirectPath);
            router.push(result.redirectPath);
            // Return here to prevent setIsLoading(false) if redirecting
            return; 
        } else {
            setError("Login successful, but redirection path was missing from server. Please try again or check server logs.");
        }
      } else if (!result) {
        console.error("LoginPage: loginAction returned no result. This might indicate a server-side crash before returning.");
        setError("Login failed due to a server communication issue. Please check server logs or try again later.");
      }
      setIsLoading(false); // Set loading to false only if not redirected by NEXT_REDIRECT

    } catch (err: any) {
      console.log("LoginPage: handleSubmit caught an error object:", err);
      console.log("LoginPage: Error name:", err.name);
      console.log("LoginPage: Error message:", err.message);
      console.log("LoginPage: Error stack:", err.stack);
      console.log("LoginPage: Error cause:", err.cause);
      console.log("LoginPage: Error digest (if any):", err.digest);

      if (err.digest?.startsWith('NEXT_REDIRECT')) {
        console.log("LoginPage: NEXT_REDIRECT signal caught (digest: " + err.digest + "). Navigation should be handled by Next.js. No client-side error to display.");
        // Next.js handles the redirect, no client-side action (like setError) needed here
        // as the component might unmount. Do NOT call setIsLoading(false) here.
        return; 
      } else {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during login.";
        setError(`Login attempt failed: ${errorMessage}. Check server logs for more details.`);
        setIsLoading(false);
      }
    } 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">Clypio - Admin</CardTitle>
          <CardDescription className="text-black">Sign in to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
        
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-black">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
        </CardContent>
        <CardFooter className="text-center text-xs text-black">
            <p>Protected by secure authentication. Only authorized users can access.</p>
          </CardFooter>
      </Card>
      </div>
    </div>
  );
}
