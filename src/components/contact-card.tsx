"use client";
import { format } from "date-fns";
import { Cake, Edit, MoreVertical, Trash2 } from "lucide-react";
import type { Contact } from "@/lib/types";
import { reminderLabels } from "@/lib/types";
import { getInitials } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContactCardProps {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
}

export function ContactCard({
  contact,
  onEdit,
  onDelete,
}: ContactCardProps) {
  return (
    <Card className="flex flex-col justify-between transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} alt={contact.name} className="object-cover" />}
            <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <CardTitle>{contact.name}</CardTitle>
            <CardDescription className="flex items-center">
              <Cake className="mr-2 h-4 w-4" />
              {format(contact.birthday, "MMMM d, yyyy")}
            </CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {contact.reminders.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Reminders
            </p>
            <div className="flex flex-wrap gap-2">
              {contact.reminders.map((reminder) => (
                <Badge key={reminder} variant="secondary">
                  {reminderLabels[reminder]}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter />
    </Card>
  );
}
