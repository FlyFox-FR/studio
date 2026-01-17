export const reminderIntervals = ["1_day", "3_days", "1_week"] as const;
export type ReminderInterval = (typeof reminderIntervals)[number];

export const reminderLabels: Record<ReminderInterval, string> = {
  "1_day": "1 day before",
  "3_days": "3 days before",
  "1_week": "1 week before",
};

export type Contact = {
  id: string;
  name: string;
  birthday: Date;
  reminders: ReminderInterval[];
  avatarUrl?: string;
};
