"use client";
import { CreateOrganizationForm } from "@/components/organization/CreateOrganizationForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/hooks/auth/useAccount";

export default function CreateOrganizationPage() {
  const { userData } = useAccount();
  const router = useRouter();

  useEffect(() => {
    // Si el usuario ya tiene organización, redirigir al explorer
    if (userData && userData.organizations && userData.organizations.length > 0) {
      router.replace("/explorer");
    }
  }, [userData, router]);

  // Si está cargando userData, puedes mostrar un loader opcional
  if (!userData) return null;
  if (userData.organizations && userData.organizations.length > 0) return null;

  return <CreateOrganizationForm />;
} 