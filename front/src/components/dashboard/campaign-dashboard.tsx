import { Campaign } from '@/types/campaign';
import { Metrics } from '@/types/metrics';

interface CampaignDashboardProps {
  campaign: Campaign;
  metrics: Metrics | null;
  loading: boolean;
}

export const CampaignDashboard = ({ campaign, metrics, loading }: CampaignDashboardProps) => {
  if (loading) {
    return (
      <div className="rounded-lg border p-6 bg-white">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Cargando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="rounded-lg border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">{campaign.name}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
            {campaign.status}
          </span>
        </div>
        <div className="p-4">
          <p className="text-gray-600 mb-6">{campaign.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <div className="text-sm text-gray-500">Presupuesto</div>
              <div className="text-2xl font-bold">${campaign.budget}</div>
              <div className="text-xs text-green-600 mt-1">▲ 23.36%</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Fecha de Inicio</div>
              <div className="text-2xl font-bold">{new Date(campaign.startDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Fecha de Fin</div>
              <div className="text-2xl font-bold">{new Date(campaign.endDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {metrics && (
        <div className="rounded-lg border bg-white">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Métricas</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(metrics.data).map(([key, value]) => (
                <div key={key} className="p-4 border rounded-md">
                  <div className="text-sm text-gray-500">{key}</div>
                  <div className="text-2xl font-bold">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 