"use client";

import { withAdminOnly } from "@/components/auth/withRole";
import { UsersView } from "@/components/users/UsersView";

function UsersPage() {
  return <UsersView />;
}

// Proteger la página para que solo administradores puedan acceder
// Si no es admin, será redirigido automáticamente a /explorer
export default withAdminOnly(UsersPage);
