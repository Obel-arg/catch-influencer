"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  CheckCircle,
  Trash2,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useFeedback } from '@/hooks/admin/useFeedback';
import { formatDateTimeArgentina } from '@/utils/dateUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type FilterType = 'all' | 'pending' | 'resolved';

export function FeedbackPanel() {
  const {
    allFeedback,
    stats,
    loading,
    error,
    updating,
    deleting,
    resolveFeedback,
    deleteFeedback,
    loadAll,
    clearError
  } = useFeedback();

  const [filter, setFilter] = useState<FilterType>('all');

  // Filtrar feedback según el filtro seleccionado
  const filteredFeedback = allFeedback.filter(feedback => {
    if (filter === 'all') return true;
    return feedback.status === filter;
  });

  const handleResolve = async (feedbackId: string) => {
    await resolveFeedback(feedbackId);
  };

  const handleDelete = async (feedbackId: string) => {
    await deleteFeedback(feedbackId);
  };

  const getStatusColor = (status: string) => {
    return status === 'pending'
      ? 'bg-orange-100 text-orange-800'
      : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
          <Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
            ✕
          </Button>
        </div>
      )}

      {/* Statistics Card */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Estadísticas de Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total_pending + stats.total_resolved}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.total_pending}
                </div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.total_resolved}
                </div>
                <div className="text-sm text-gray-600">Resueltos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Feedback ({filteredFeedback.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pendientes
              </Button>
              <Button
                variant={filter === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('resolved')}
              >
                Resueltos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadAll}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No hay feedback para mostrar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <h4 className="font-semibold">
                        {feedback.user_profiles?.full_name || 'Usuario'}
                      </h4>
                      <Badge className={getStatusColor(feedback.status)}>
                        {feedback.status === 'pending' ? 'Pendiente' : 'Resuelto'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTimeArgentina(feedback.created_at)}
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-xs text-gray-500">
                      {feedback.user_profiles?.email}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    {feedback.message}
                  </p>

                  {feedback.resolved_at && (
                    <div className="text-xs text-gray-500 mb-3">
                      Resuelto el {formatDateTimeArgentina(feedback.resolved_at)}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {feedback.status === 'pending' && (
                      <Button
                        onClick={() => handleResolve(feedback.id)}
                        disabled={updating}
                        size="sm"
                        variant="outline"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Marcar como resuelto
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deleting === feedback.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
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
                            onClick={() => handleDelete(feedback.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
