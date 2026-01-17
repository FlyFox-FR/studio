"use client";

import * as React from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/lib/types";
import { initialContacts } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { ContactForm } from "@/components/contact-form";
import { ContactList } from "@/components/contact-list";
import { UpcomingReminders } from "@/components/upcoming-reminders";

export function ContactManager() {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingContact, setEditingContact] = React.useState<Contact | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    try {
      const storedContacts = localStorage.getItem("remember-when-contacts");
      if (storedContacts) {
        const parsedContacts: Omit<Contact, "birthday"> & {
          birthday: string;
        }[] = JSON.parse(storedContacts);
        setContacts(
          parsedContacts.map((c) => ({ ...c, birthday: new Date(c.birthday) }))
        );
      } else {
        setContacts(initialContacts);
      }
    } catch (error) {
      console.error("Failed to load contacts from localStorage", error);
      setContacts(initialContacts);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem("remember-when-contacts", JSON.stringify(contacts));
    } catch (error) {
      console.error("Failed to save contacts to localStorage", error);
    }
  }, [contacts]);

  const handleOpenForm = (contact: Contact | null = null) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContact(null);
  };

  const handleSaveContact = (contact: Omit<Contact, "id">, id?: string) => {
    if (id) {
      setContacts(
        contacts.map((c) =>
          c.id === id ? { ...c, ...contact, id } : c
        )
      );
      toast({
        title: "Contact Updated",
        description: `${contact.name}'s details have been updated.`,
      });
    } else {
      setContacts([...contacts, { ...contact, id: crypto.randomUUID() }]);
      toast({
        title: "Contact Added",
        description: `${contact.name} has been added to your list.`,
      });
    }
    handleCloseForm();
  };

  const handleDeleteContact = (id: string) => {
    const contactToDelete = contacts.find((c) => c.id === id);
    if(contactToDelete) {
      setContacts(contacts.filter((c) => c.id !== id));
      toast({
        title: "Contact Deleted",
        description: `${contactToDelete.name} has been removed.`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="font-headline text-xl font-bold text-foreground sm:text-2xl">
            RememberWhen
          </h1>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Add Contact</span>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto p-4 md:p-6">
          <UpcomingReminders contacts={contacts} />
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-6 w-6 text-foreground" />
              <h2 className="font-headline text-2xl font-bold">Contacts</h2>
            </div>
            <ContactList
              contacts={contacts}
              onEdit={handleOpenForm}
              onDelete={handleDeleteContact}
            />
          </div>
        </div>
      </main>

      <ContactForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveContact}
        contact={editingContact}
      />
    </>
  );
}
