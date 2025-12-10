"use client"

import { FeedbackPanel } from '@/components/admin/FeedbackPanel';
import { withAdminOnly } from '@/components/auth/withRole';

function AdminFeedbackPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Feedback
          </h1>
          <p className="text-gray-600 mt-2">
            Visualiza y gestiona el feedback de los usuarios
          </p>
        </div>

        <FeedbackPanel />
      </div>
    </div>
  );
}

// Proteger la página - solo roles admin y owner pueden acceder
export default withAdminOnly(AdminFeedbackPage);
