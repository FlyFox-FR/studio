"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse, isValid } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Trash2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn, getInitials } from "@/lib/utils";
import type { Contact, ReminderInterval } from "@/lib/types";
import { reminderIntervals, reminderLabels } from "@/lib/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  name: z.string().min(2, "Der Name muss mindestens 2 Zeichen lang sein."),
  birthday: z.date({
    required_error: "Ein Geburtsdatum ist erforderlich.",
  }),
  reminders: z.array(z.string()).optional(),
  avatarUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (contact: Omit<Contact, "id">, id?: string) => void;
  contact: Contact | null;
}

export function ContactForm({
  isOpen,
  onOpenChange,
  onSave,
  contact,
}: ContactFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      birthday: undefined,
      reminders: [],
      avatarUrl: "",
    },
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    if (isOpen) {
      if (contact) {
        form.reset({
          name: contact.name,
          birthday: contact.birthday,
          reminders: contact.reminders,
          avatarUrl: contact.avatarUrl,
        });
      } else {
        form.reset({
          name: "",
          birthday: undefined,
          reminders: [],
          avatarUrl: "",
        });
      }
    }
  }, [contact, form, isOpen]);
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue("avatarUrl", dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    form.setValue("avatarUrl", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (values: FormValues) => {
    onSave(values, contact?.id);
  };

  const avatarUrl = form.watch("avatarUrl");
  const name = form.watch("name");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {contact ? "Kontakt bearbeiten" : "Neuen Kontakt hinzufügen"}
          </DialogTitle>
          <DialogDescription>
            {contact
              ? "Ändere die Details deines Kontakts."
              : "Füge eine neue Person zu deiner Erinnerungsliste hinzu."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="avatarUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Profilbild</FormLabel>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={avatarUrl ?? undefined} alt="Avatar" className="object-cover" />
                        <AvatarFallback className="text-3xl">
                          {getInitials(name || " ")}
                        </AvatarFallback>
                      </Avatar>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleImageChange}
                        accept="image/png, image/jpeg, image/gif"
                      />
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Hochladen
                        </Button>
                        {avatarUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveImage}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Entfernen
                          </Button>
                        )}
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Max Mustermann" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Geburtstag</FormLabel>
                    <div className="flex items-center gap-2">
                       <Input
                        placeholder="dd.MM.yyyy"
                        value={field.value ? format(field.value, 'dd.MM.yyyy') : ''}
                        onChange={(e) => {
                          const date = parse(e.target.value, 'dd.MM.yyyy', new Date());
                          if (isValid(date)) {
                            field.onChange(date);
                          } else {
                            field.onChange(undefined);
                          }
                        }}
                      />
                      <Popover modal={false}>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            size="icon"
                            className={cn("w-10 flex-shrink-0", !field.value && "text-muted-foreground")}
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            locale={de}
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            defaultMonth={field.value}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reminders"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Erinnerungen</FormLabel>
                      <FormDescription>
                        Wähle aus, wann du erinnert werden möchtest.
                      </FormDescription>
                    </div>
                    <div className="space-y-2">
                    {reminderIntervals.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="reminders"
                        render={({ field }) => (
                          <FormItem
                            key={item}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  const currentReminders = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentReminders, item]);
                                  } else {
                                    field.onChange(
                                      currentReminders.filter((value) => value !== item)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {reminderLabels[item as ReminderInterval]}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">
                {contact ? "Änderungen speichern" : "Kontakt hinzufügen"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
