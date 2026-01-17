"use client";

import type { Contact } from "@/lib/types";
import {
  differenceInDays,
  format,
  isToday,
  isTomorrow,
  setYear,
} from "date-fns";
import { Cake, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getInitials } from "@/lib/utils";

type UpcomingContact = Contact & { nextBirthday: Date };

const getUpcomingBirthdays = (
  contacts: Contact[],
  days: number
): UpcomingContact[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return contacts
    .map((contact) => {
      const birthday = contact.birthday;
      let nextBirthday = setYear(birthday, today.getFullYear());
      if (nextBirthday < today) {
        nextBirthday = setYear(birthday, today.getFullYear() + 1);
      }
      return { ...contact, nextBirthday };
    })
    .filter((contact) => {
      const diff = differenceInDays(contact.nextBirthday, today);
      return diff >= 0 && diff <= days;
    })
    .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());
};

function formatUpcomingDate(date: Date): string {
  if (isToday(date)) return "Today!";
  if (isTomorrow(date)) return "Tomorrow";
  return `on ${format(date, "MMMM d")}`;
}

export function UpcomingReminders({ contacts }: { contacts: Contact[] }) {
  const upcoming = getUpcomingBirthdays(contacts, 30);

  if (upcoming.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="h-6 w-6 text-foreground" />
        <h2 className="font-headline text-2xl font-bold">Upcoming Birthdays</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {upcoming.map((contact) => (
          <Card key={contact.id} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <Avatar>
                {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} alt={contact.name} className="object-cover" />}
                <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <CardTitle className="text-lg">{contact.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Cake className="mr-2 h-4 w-4" />
                <span>
                  Turns {contact.nextBirthday.getFullYear() - contact.birthday.getFullYear()}{" "}
                  <span className="font-semibold text-foreground">
                    {formatUpcomingDate(contact.nextBirthday)}
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
