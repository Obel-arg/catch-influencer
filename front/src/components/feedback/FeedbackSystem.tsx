"use client"

import { FeedbackButton } from "./FeedbackButton"
import { PendingFeedbackCounter } from "./PendingFeedbackCounter"
import { useRoleContext } from "@/contexts/RoleContext"

interface FeedbackSystemProps {
  userEmail: string
}

export function FeedbackSystem({ userEmail }: FeedbackSystemProps) {
  // Use RoleContext instead of useRoleCache to ensure consistent role state
  const { isAdmin, isOwner, loading } = useRoleContext()

  // Show nothing while loading to avoid flashing wrong component
  if (loading) {
    return null
  }

  // Para admin/owner, mostrar el contador de feedbacks pendientes
  if (isAdmin() || isOwner()) {
    return <PendingFeedbackCounter userEmail={userEmail} />
  }

  // Para usuarios normales (member/viewer), mostrar el botón de enviar feedback
  return <FeedbackButton userEmail={userEmail} />
} 