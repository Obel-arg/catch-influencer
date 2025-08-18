"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AuthDebug() {
  const { user, isLoading, isInitialized } = useAuthContext();
  const isAuthenticated = !!user;

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Auth Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isLoading
              ? "Loading"
              : isAuthenticated
              ? "Authenticated"
              : "Not Authenticated"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span>Initialized:</span>
          <Badge variant={isInitialized ? "default" : "secondary"}>
            {isInitialized ? "Yes" : "No"}
          </Badge>
        </div>

        {user && (
          <div className="space-y-1">
            <div>
              <strong>User ID:</strong> {user.id}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Name:</strong> {user.full_name || "N/A"}
            </div>
            <div>
              <strong>Role:</strong> {user.role || "N/A"}
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <div>
            <strong>Token:</strong>{" "}
            {localStorage.getItem("token") ? "Present" : "Missing"}
          </div>
          <div>
            <strong>Refresh Token:</strong>{" "}
            {localStorage.getItem("refreshToken") ? "Present" : "Missing"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
