"use client"

import { useState, useEffect } from "react"
import { getApiBaseUrl } from '@/lib/services/apiBase';
import { MessageSquare, CheckCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Feedback {
  id: string
  user_id: string
  message: string
  status: 'pending' | 'resolved'
  route?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  resolved_by?: string
  user_profiles?: {
    id: string
    full_name: string
    email: string
  }
}

interface PendingFeedbackCounterProps {
  userEmail: string
}

export function PendingFeedbackCounter({ userEmail }: PendingFeedbackCounterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending')

  if (!userEmail.includes('@obel.la')) {
    return null
  }

  const fetchPendingCount = async () => {
    try {
      const backendUrl = getApiBaseUrl();
      const response = await fetch(`${backendUrl}/feedback/pending-count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPendingCount(data.data.pending_count)
      }
    } catch (error) {
      console.error('Error fetching pending count:', error)
    }
  }

  const fetchAllFeedback = async () => {
    setIsLoading(true)
    try {
      const backendUrl = getApiBaseUrl();
      const response = await fetch(`${backendUrl}/feedback/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAllFeedback(data.data)
      }
    } catch (error) {
      console.error('Error fetching all feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolveFeedback = async (feedbackId: string) => {
    try {
      const backendUrl = getApiBaseUrl();
      const response = await fetch(`${backendUrl}/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'resolved' })
      })

      if (response.ok) {
        // Actualizar la lista y el conteo
        await Promise.all([fetchAllFeedback(), fetchPendingCount()])
      }
    } catch (error) {
      console.error('Error resolving feedback:', error)
    }
  }

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      const backendUrl = getApiBaseUrl();
      const response = await fetch(`${backendUrl}/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        // Actualizar la lista y el conteo
        await Promise.all([fetchAllFeedback(), fetchPendingCount()])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error deleting feedback:', response.status, errorData)
        alert('Error al eliminar el feedback. Por favor, inténtalo de nuevo.')
      }
    } catch (error) {
      console.error('Error deleting feedback:', error)
      alert('Error al eliminar el feedback. Por favor, inténtalo de nuevo.')
    }
  }

  useEffect(() => {
    fetchPendingCount()
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchAllFeedback()
    }
  }, [isOpen])

  const pendingFeedback = allFeedback.filter(f => f.status === 'pending')
  const resolvedFeedback = allFeedback.filter(f => f.status === 'resolved')

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
          title="Gestión de feedbacks"
        >
          <MessageSquare size={20} />
          {pendingCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center rounded-full text-xs"
            >
              {pendingCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 max-h-[600px] p-0 overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white flex flex-col"
        align="end"
        sideOffset={8}
      >
        {/* Header con Tabs */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Gestión de Feedbacks</h3>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {pendingCount} pendientes
              </Badge>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pending' | 'resolved')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                Pendientes
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex items-center gap-2">
                Resueltos
                {resolvedFeedback.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {resolvedFeedback.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab Pendientes */}
            <TabsContent value="pending" className="mt-4 flex-1">
              <div className="h-full overflow-y-auto bg-white">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Cargando feedbacks...</p>
                  </div>
                ) : pendingFeedback.length > 0 ? (
                  <>
                    {pendingFeedback.map((feedback, index) => (
                      <div key={feedback.id}>
                        <div className="p-4 hover:bg-gray-50 transition-colors bg-white border-l-4 border-l-orange-500">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col">
                                  <p className="text-xs font-semibold text-gray-900">
                                    {feedback.user_profiles?.full_name || 'Usuario'}
                                  </p>
                                  <span className="text-[10px] text-gray-500">
                                    {feedback.user_profiles?.email}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleResolveFeedback(feedback.id)}
                                    className="text-xs h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle size={12} />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 size={12} />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar feedback?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta acción no se puede deshacer. El feedback será eliminado permanentemente.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteFeedback(feedback.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Eliminar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                              <p className="text-xs text-gray-700 leading-4 mb-2">
                                {feedback.message}
                              </p>
                              {feedback.route && (
                                <p className="text-xs text-blue-600 mb-2">
                                  📍 Ruta: {feedback.route}
                                </p>
                              )}
                              <div className="flex items-center">
                                <p className="text-[10px] text-gray-400">
                                  {formatDistanceToNow(new Date(feedback.created_at), { 
                                    addSuffix: true, 
                                    locale: es 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < pendingFeedback.length - 1 && (
                          <Separator className="bg-gray-100" />
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-12 text-center text-gray-500 bg-white">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageSquare size={24} className="text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-700 text-sm">No hay feedbacks pendientes</p>
                    <p className="text-xs text-gray-500 mt-1">Todos los feedbacks han sido resueltos</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Resueltos */}
            <TabsContent value="resolved" className="mt-4 flex-1">
              <div className="h-full overflow-y-auto bg-white">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Cargando feedbacks...</p>
                  </div>
                ) : resolvedFeedback.length > 0 ? (
                  <>
                    {resolvedFeedback.map((feedback, index) => (
                      <div key={feedback.id}>
                        <div className="p-4 hover:bg-gray-50 transition-colors bg-white border-l-4 border-l-green-500">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col">
                                  <p className="text-xs font-semibold text-gray-900">
                                    {feedback.user_profiles?.full_name || 'Usuario'}
                                  </p>
                                  <span className="text-[10px] text-gray-500">
                                    {feedback.user_profiles?.email}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                    <CheckCircle size={12} className="mr-1" />
                                    Resuelto
                                  </Badge>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 size={12} />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar feedback?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta acción no se puede deshacer. El feedback será eliminado permanentemente.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteFeedback(feedback.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Eliminar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                              <p className="text-xs text-gray-700 leading-4 mb-2">
                                {feedback.message}
                              </p>
                              {feedback.route && (
                                <p className="text-xs text-blue-600 mb-2">
                                  📍 Ruta: {feedback.route}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < resolvedFeedback.length - 1 && (
                          <Separator className="bg-gray-100" />
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-12 text-center text-gray-500 bg-white">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={24} className="text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-700 text-sm">No hay feedbacks resueltos</p>
                    <p className="text-xs text-gray-500 mt-1">Aún no se han resuelto feedbacks</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
} 