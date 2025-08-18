"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Slack, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Settings,
  RefreshCw,
  TestTube
} from 'lucide-react';
import { useAlerts } from '@/hooks/admin/useAlerts';
import { formatDateTimeArgentina } from '@/utils/dateUtils';

export function AlertsPanel() {
  const {
    config,
    activeAlerts,
    metrics,
    loading,
    error,
    slackConfiguring,
    slackTesting,
    configureSlack,
    testSlack,
    updateConfig,
    acknowledgeAlert,
    getSlackChannel,
    isSlackConfigured,
    clearError
  } = useAlerts();

  const [webhookUrl, setWebhookUrl] = useState('');
  const [acknowledgedBy, setAcknowledgedBy] = useState('');

  const handleConfigureSlack = async () => {
    if (!webhookUrl.trim()) return;
    
    const success = await configureSlack(webhookUrl.trim());
    if (success) {
      setWebhookUrl('');
    }
  };

  const handleTestSlack = async () => {
    await testSlack();
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    if (!acknowledgedBy.trim()) return;
    
    const success = await acknowledgeAlert(alertId, acknowledgedBy.trim());
    if (success) {
      setAcknowledgedBy('');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
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
      {/* Configuración de Slack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Slack className="h-5 w-5" />
            Configuración de Slack
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
              <Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
                ✕
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Webhook URL de Slack</label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleConfigureSlack}
                  disabled={!webhookUrl.trim() || slackConfiguring}
                  size="sm"
                >
                  {slackConfiguring ? 'Configurando...' : 'Configurar'}
                </Button>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={handleTestSlack}
                disabled={!isSlackConfigured() || slackTesting}
                variant="outline"
                size="sm"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {slackTesting ? 'Probando...' : 'Probar Notificación'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isSlackConfigured() ? "default" : "secondary"}>
              {isSlackConfigured() ? '✅ Configurado' : '❌ No configurado'}
            </Badge>
            {config?.alertChannels.find(c => c.type === 'slack')?.enabled && (
              <Badge variant="outline">Activo</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Alertas */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Métricas de Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.totalAlerts}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{metrics.activeAlerts}</div>
                <div className="text-sm text-gray-600">Activas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.acknowledgedAlerts}</div>
                <div className="text-sm text-gray-600">Reconocidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.escalationCount}</div>
                <div className="text-sm text-gray-600">Escalaciones</div>
              </div>
            </div>

            {/* Distribución por severidad */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Por Severidad</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(metrics.alertsBySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <Badge className={getSeverityColor(severity)}>
                      {getSeverityIcon(severity)}
                      <span className="ml-1">{severity}</span>
                    </Badge>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas Activas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Activas ({activeAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No hay alertas activas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(alert.severity)}
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTimeArgentina(alert.timestamp)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{alert.message}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-xs text-gray-500">Fuente:</span>
                      <p className="text-sm font-medium">{alert.source}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {alert.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {Object.keys(alert.context).length > 0 && (
                    <details className="mb-3">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                        Ver contexto técnico
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(alert.context, null, 2)}
                      </pre>
                    </details>
                  )}

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Tu nombre/email"
                      value={acknowledgedBy}
                      onChange={(e) => setAcknowledgedBy(e.target.value)}
                      className="flex-1 max-w-xs"
                    />
                    <Button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      disabled={!acknowledgedBy.trim()}
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Reconocer
                    </Button>
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