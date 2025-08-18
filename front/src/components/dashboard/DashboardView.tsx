"use client";

import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";
import { AssignedCampaigns } from "@/components/dashboard/assigned-campaigns";

export function DashboardView() {
  // TODO: Integrar con la API para obtener las campañas asignadas reales
  // const { data: campaigns, loading } = useAssignedCampaigns();
  
  return (
    <Suspense fallback={
      <Loader 
        variant="primary"
        size="lg"
      />
    }>
      {/* Pasamos un array vacío por defecto hasta que se integre con la API */}
      <AssignedCampaigns campaigns={[]} loading={false} />
    </Suspense>
  );
} 