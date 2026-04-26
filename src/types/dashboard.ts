export type SystemStatus = "online" | "offline" | "degraded";

export type LicenseTier = "trial" | "extended" | "enterprise";

export type UserLicense = {
  tier: LicenseTier;
  tierLabel: string;
  statusLabel: string;
  statusVariant: "default" | "secondary" | "destructive" | "outline";
  daysRemaining?: number;
  isUpgraded?: boolean;
};

export type UserProfile = {
  name: string;
  initials: string;
  avatarUrl?: string;
};

export type MessageStats = {
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  activeChats: number;
};

export type TrendStat = {
  label: string;
  delta: number;
  accentClass: string;
};

export type MetricCardData = {
  id: string;
  title: string;
  value: number;
  trend: TrendStat;
  iconClass: string;
};

export type SummaryRow = {
  label: string;
  value: number;
};

export type SummaryCardData = {
  id: string;
  title: string;
  rows: SummaryRow[];
  progress: number;
  icon: "reply" | "bulk" | "bot" | "template";
};

export type DashboardKpiIconKey =
  | "users"
  | "revenue"
  | "messages"
  | "delivery"
  | "sessions"
  | "response";

export type DashboardKpiTrend = "positive" | "negative" | "neutral";

export type DashboardKpiCardData = {
  id: string;
  label: string;
  value: string;
  period: string;
  changeLabel: string;
  /** @deprecated Use `trend` from the dashboard API. */
  trendPositive?: boolean;
  trend?: DashboardKpiTrend;
  iconKey: DashboardKpiIconKey;
};

export type DashboardBarPoint = {
  label: string;
  value: number;
};

export type DashboardLinePoint = {
  x: string;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
};

export type DashboardOverview = {
  systemStatus: SystemStatus;
  lastUpdated: string;
  devicesOnline: number;
  messagesToday: number;
  metrics: MetricCardData[];
  summaries: SummaryCardData[];
};

/** `GET /v1/dashboard/overview` — workspace-scoped aggregates. */
export type DashboardOverviewResponse = {
  generatedAt: string;
  systemStatus: SystemStatus;
  lastUpdatedLabel: string;
  devicesOnline: number;
  devicesTotal: number;
  messagesToday: number;
  kpis: DashboardKpiCardData[];
  barSeries: DashboardBarPoint[];
  lineSeries: DashboardLinePoint[];
  summaries: SummaryCardData[];
};
