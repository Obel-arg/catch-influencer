// Constantes para estados de campaña
export const CAMPAIGN_STATUS_COLORS = {
  active: "bg-green-500 hover:bg-green-600 text-white",
  planned: "bg-blue-500 hover:bg-blue-600 text-white", 
  completed: "bg-purple-500 hover:bg-purple-600 text-white",
  paused: "bg-yellow-500 hover:bg-yellow-600 text-white",
  draft: "bg-orange-500 hover:bg-orange-600 text-white",
  default: "bg-gray-500 hover:bg-gray-600 text-white"
} as const;

export const CAMPAIGN_STATUS_LABELS = {
  active: 'Activa',
  planned: 'Planificada', 
  completed: 'Completada',
  paused: 'Pausada',
  draft: 'Borrador'
} as const;

export const EMPTY_STATE_METRICS = {
  influencers: 0,
  posts: 0,
  engagement: 0
} as const;

// Constantes para objetivos de campaña
export const CAMPAIGN_GOALS = [
  { value: 'Reach', label: 'Alcance', placeholder: 'ej: 1000000' },
  { value: 'Engagement', label: 'Engagement', placeholder: 'ej: 5.2' },
  { value: 'Likes', label: 'Likes', placeholder: 'ej: 50000' },
  { value: 'Comments', label: 'Comentarios', placeholder: 'ej: 1000' }
] as const;

export const CAMPAIGN_GOAL_UNITS = {
  Reach: 'personas',
  Engagement: '%',
  Likes: 'likes',
  Comments: 'comentarios'
} as const;

// Tipos derivados
export type CampaignStatusKey = keyof typeof CAMPAIGN_STATUS_COLORS;
export type CampaignStatusLabel = keyof typeof CAMPAIGN_STATUS_LABELS;
export type CampaignGoalType = typeof CAMPAIGN_GOALS[number]['value']; 