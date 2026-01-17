import type { Contact } from "./types";

export const initialContacts: Contact[] = [
  {
    id: "1",
    name: "Alex Doe",
    birthday: new Date("1995-07-20"),
    reminders: ["1_day", "1_week"],
  },
  {
    id: "2",
    name: "Samantha Smith",
    birthday: new Date("1988-12-15"),
    reminders: ["3_days"],
  },
  {
    id: "3",
    name: "Michael Johnson",
    birthday: new Date("2001-03-02"),
    reminders: ["1_day", "3_days", "1_week"],
  },
];
