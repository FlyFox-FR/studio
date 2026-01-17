"use client";

import * as React from "react";
import { Plus, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/lib/types";
import { initialContacts } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { ContactForm } from "@/components/contact-form";
import { ContactList } from "@/components/contact-list";
import { UpcomingReminders } from "@/components/upcoming-reminders";
import { SettingsSheet } from "@/components/settings-sheet";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function ContactManager() {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingContact, setEditingContact] = React.useState<Contact | null>(null);
  const { toast } = useToast();

  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((swReg) => {
          console.log("Service Worker is registered", swReg);
          setNotificationPermission(Notification.permission);
          swReg.pushManager.getSubscription().then((subscription) => {
            if (subscription) {
              setIsSubscribed(true);
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker Error", error);
        });
    }
  }, []);
  
  const handleRequestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({ title: "This browser does not support desktop notification", variant: "destructive" });
      return;
    }
  
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  
    if (permission === "granted") {
      subscribeUserToPush();
    } else {
      toast({ title: "Notification permission denied.", description: "You won't receive birthday reminders.", variant: "destructive" });
    }
  };
  
  const subscribeUserToPush = async () => {
    const swRegistration = await navigator.serviceWorker.ready;
    try {
      const applicationServerKey = urlBase64ToUint8Array('BNo_3GfW-w4eJ3eED1pM8jYihS0iV4gP1kMh0iLGpn8F1bV7A1i-8o7GvL4gSfuwaX-oaqN-XwzJz4sXj8XJz5E');
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      console.log("User is subscribed:", subscription);
      setIsSubscribed(true);
      toast({ title: "Notifications enabled!", description: "You're all set to receive reminders." });
      // In a real app, you would send the subscription to your backend server.
    } catch (error) {
      console.error("Failed to subscribe the user: ", error);
      toast({ title: "Couldn't subscribe to notifications.", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleTestNotification = () => {
    if (!isSubscribed) {
      toast({ title: "Not Subscribed", description: "Please enable notifications first.", variant: "destructive" });
      return;
    }

    // This is a client-side notification for testing purposes.
    // A real push notification must be triggered from a server.
    navigator.serviceWorker.ready.then(registration => {
        registration.showNotification("Test Notification", {
            body: "This is a test notification from RememberWhen!",
            icon: "icon.png"
        })
    });

    toast({
      title: "Test notification sent",
      description: "You should see a notification shortly. If not, check your browser and OS settings.",
    });
  };

  React.useEffect(() => {
    try {
      const storedContacts = localStorage.getItem("remember-when-contacts");
      if (storedContacts) {
        const parsedContacts: (Omit<Contact, "birthday"> & {
          birthday: string;
        })[] = JSON.parse(storedContacts);
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

  const handleSaveContact = (contactData: Omit<Contact, "id">, id?: string) => {
    if (id) {
      setContacts(
        contacts.map((c) =>
          c.id === id ? { ...c, ...contactData, id } : c
        )
      );
      toast({
        title: "Contact Updated",
        description: `${contactData.name}'s details have been updated.`,
      });
    } else {
      setContacts([...contacts, { ...contactData, id: crypto.randomUUID() }]);
      toast({
        title: "Contact Added",
        description: `${contactData.name} has been added to your list.`,
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
          <div className="flex items-center gap-2">
            <Button onClick={() => handleOpenForm()}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-2">Add Contact</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
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
      <SettingsSheet
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        notificationPermission={notificationPermission}
        isSubscribed={isSubscribed}
        handleRequestNotificationPermission={handleRequestNotificationPermission}
        handleTestNotification={handleTestNotification}
      />
    </>
  );
}
