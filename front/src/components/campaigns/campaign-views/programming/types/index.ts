export interface ContentItem {
  id: string
  title: string
  influencer: {
    id: string
    name: string
    handle: string
    image: string
  }
  startDate: string
  endDate: string
  platform: string
  type: string
  status: "completed" | "in-progress" | "pending"
  objectives: Objective[]
  description?: string
  content_url?: string
}

export interface Objective {
  id: string
  title: string
  target: string
  current: string
  status: "completed" | "in-progress" | "not-started"
  percentComplete: number
}

export interface TimelineColumn {
  date: Date
  dateKey: string
  label: string
  subLabel: string
}

export interface CampaignProgrammingProps {
  campaign: any // Campaign type from @/types/campaign
}

export type ZoomLevel = "day" | "week" | "month"
export type ViewType = "gantt" | "list" | "calendar"
export type ContentStatus = "completed" | "in-progress" | "pending"
export type ObjectiveStatus = "completed" | "in-progress" | "not-started" 