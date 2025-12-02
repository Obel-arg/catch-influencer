import { httpApiClient } from '@/lib/http';

export async function generateShareLink(campaignId: string): Promise<{
  shareToken: string;
  shareUrl: string;
}> {
  const response = await httpApiClient.post(`/campaigns/${campaignId}/share`);
  return response.data;
}

export async function fetchSharedCampaign(token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const response = await fetch(`${apiUrl}/campaigns/share/${token}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shared campaign');
  }

  const data = await response.json();
  return data.campaign;
}

export async function fetchSharedCampaignMetrics(token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const response = await fetch(`${apiUrl}/campaigns/share/${token}/metrics`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shared campaign metrics');
  }

  return await response.json();
}
