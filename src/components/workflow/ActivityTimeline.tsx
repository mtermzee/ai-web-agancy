"use client";

import { Activity, FileText, Gauge, LayoutTemplate, MessageSquareText, Sparkles, Tag } from "lucide-react";
import type { ActivityType, LeadActivity } from "@/types/workflow";

const icons: Record<ActivityType, typeof Activity> = {
  analysis: Sparkles,
  status: Activity,
  priority: Tag,
  score: Gauge,
  note: FileText,
  mockup: LayoutTemplate,
  outreach: MessageSquareText,
};

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function ActivityTimeline({ activities }: { activities: LeadActivity[] }) {
  return <div className="activity-timeline">
    {activities.map((activity) => {
      const Icon = icons[activity.type];
      return <div className="activity-item" key={activity.id}>
        <div className={`activity-icon ${activity.type}`}><Icon size={15}/></div>
        <div className="activity-copy">
          <div className="activity-title"><strong>{activity.title}</strong><time>{formatDate(activity.createdAt)}</time></div>
          {activity.detail && <p>{activity.detail}</p>}
        </div>
      </div>;
    })}
  </div>;
}
