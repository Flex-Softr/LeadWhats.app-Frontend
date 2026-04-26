import type {
  DashboardBarPoint,
  DashboardKpiCardData,
  DashboardLinePoint,
} from "@/types/dashboard";

export const dashboardKpiCards: DashboardKpiCardData[] = [
  {
    id: "devices",
    label: "Connected devices",
    value: "12",
    period: "Last 30 days",
    changeLabel: "+ 18.2%",
    trendPositive: true,
    iconKey: "sessions",
  },
  {
    id: "messages",
    label: "Messages sent",
    value: "24.8K",
    period: "Last 30 days",
    changeLabel: "+ 32.54%",
    trendPositive: true,
    iconKey: "messages",
  },
  {
    id: "delivery",
    label: "Delivery rate",
    value: "98.4%",
    period: "Last 30 days",
    changeLabel: "+ 4.12%",
    trendPositive: true,
    iconKey: "delivery",
  },
  {
    id: "users",
    label: "Active conversations",
    value: "430",
    period: "Last 30 days",
    changeLabel: "+ 12.80%",
    trendPositive: true,
    iconKey: "users",
  },
  {
    id: "response",
    label: "Median response (s)",
    value: "1.4",
    period: "Last 30 days",
    changeLabel: "− 8.10%",
    trendPositive: false,
    iconKey: "response",
  },
  {
    id: "revenue",
    label: "Attributed revenue",
    value: "$36.2K",
    period: "Last 30 days",
    changeLabel: "+ 21.05%",
    trendPositive: true,
    iconKey: "revenue",
  },
];

export const dashboardBarSeries: DashboardBarPoint[] = [
  { label: "Jan", value: 42 },
  { label: "Feb", value: 58 },
  { label: "Mar", value: 49 },
  { label: "Apr", value: 76 },
  { label: "May", value: 62 },
  { label: "Jun", value: 89 },
];

export const dashboardLineSeries: DashboardLinePoint[] = [
  { x: "1", s1: 12, s2: 18, s3: 10, s4: 22 },
  { x: "2", s1: 22, s2: 24, s3: 16, s4: 28 },
  { x: "3", s1: 18, s2: 32, s3: 22, s4: 26 },
  { x: "4", s1: 28, s2: 30, s3: 26, s4: 34 },
  { x: "5", s1: 34, s2: 36, s3: 30, s4: 40 },
  { x: "6", s1: 30, s2: 42, s3: 34, s4: 44 },
  { x: "7", s1: 40, s2: 48, s3: 38, s4: 50 },
  { x: "8", s1: 44, s2: 52, s3: 42, s4: 56 },
  { x: "9", s1: 50, s2: 58, s3: 48, s4: 60 },
  { x: "10", s1: 56, s2: 62, s3: 52, s4: 66 },
];
