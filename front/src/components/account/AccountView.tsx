"use client";

import { Suspense, useState } from "react";
import { Loader } from "@/components/ui/loader";
import { AccountSettings } from "@/components/account/account-settings";
import { useAccount } from "@/hooks/auth/useAccount";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AccountView() {
  const { userData, isLoading } = useAccount();
  const [tab, setTab] = useState("profile");

  if (isLoading || !userData) {
    return <div className="flex items-center justify-center min-h-[600px]"><Loader size="lg" /></div>;
  }

  return (
    <AccountSettings />
  );
} 