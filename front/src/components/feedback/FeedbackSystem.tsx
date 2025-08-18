"use client"

import { FeedbackButton } from "./FeedbackButton"
import { PendingFeedbackCounter } from "./PendingFeedbackCounter"

interface FeedbackSystemProps {
  userEmail: string
}

export function FeedbackSystem({ userEmail }: FeedbackSystemProps) {
  // Para usuarios de obel.la, mostrar el contador de feedbacks pendientes
  if (userEmail.includes('@obel.la')) {
    return <PendingFeedbackCounter userEmail={userEmail} />
  }

  // Para usuarios que NO son de obel.la, mostrar el botón de enviar feedback
  return <FeedbackButton userEmail={userEmail} />
} 