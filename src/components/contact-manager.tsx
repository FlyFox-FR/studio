"use client";

import * as React from "react";
import { Plus, Settings, Users } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Contact } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ContactForm } from "@/components/contact-form";
import { ContactList } from "@/components/contact-list";
import { UpcomingReminders } from "@/components/upcoming-reminders";
import { SettingsSheet } from "@/components/settings-sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getAllContacts,
  saveContact,
  deleteContact,
  bulkAddContacts,
} from "@/lib/db";

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
  const [editingContact, setEditingContact] = React.useState<Contact | null>(
    null
  );
  const { toast } = useToast();

  const [notificationPermission, setNotificationPermission] =
    React.useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [contactToDeleteId, setContactToDeleteId] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((swReg) => {
          console.log("Service Worker ist registriert", swReg);
          // Check for existing permission and subscription status
          setNotificationPermission(Notification.permission);
          swReg.pushManager.getSubscription().then((subscription) => {
            if (subscription) {
              console.log("Bestehendes Abo gefunden.");
              setIsSubscribed(true);
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker Fehler", error);
        });
    }
  }, []);

  const handleRequestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Dieser Browser unterstützt keine Desktop-Benachrichtigungen",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        await subscribeUserToPush();
      } else {
        toast({
          title: "Benachrichtigungs-Berechtigung verweigert.",
          description: "Du wirst keine Geburtstagserinnerungen erhalten.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fehler bei der Anforderung der Berechtigung:", error);
      toast({
        title: "Fehler bei der Berechtigungsanfrage",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  };

  const subscribeUserToPush = async () => {
    try {
      const swRegistration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(
        "BNo_3GfW-w4eJ3eED1pM8jYihS0iV4gP1kMh0iLGpn8F1bV7A1i-8o7GvL4gSfuwaX-oaqN-XwzJz4sXj8XJz5E"
      );
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      console.log("Benutzer ist angemeldet:", subscription);
      setIsSubscribed(true);
      toast({
        title: "Benachrichtigungen aktiviert!",
        description: "Du bist bereit, Erinnerungen zu erhalten.",
      });
      // In a real app, you would send the subscription to your backend server.
    } catch (error) {
      console.error("Anmeldung für Push-Benachrichtigungen fehlgeschlagen: ", error);
      // Reset subscription status on failure
      setIsSubscribed(false); 
      
      if (Notification.permission === 'denied') {
        toast({
          title: "Anmeldung für Benachrichtigungen fehlgeschlagen.",
          description: "Die Berechtigung wurde verweigert. Bitte in den Browsereinstellungen ändern.",
          variant: "destructive",
        });
      } else {
         toast({
          title: "Anmeldung für Benachrichtigungen fehlgeschlagen.",
          description: "Bitte versuche es erneut.",
          variant: "destructive",
        });
      }
    }
  };

  const handleTestNotification = () => {
    if (!isSubscribed) {
      toast({
        title: "Nicht angemeldet",
        description: "Bitte aktiviere zuerst die Benachrichtigungen.",
        variant: "destructive",
      });
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification("Test-Benachrichtigung 🎂", {
        body: "Wenn du das siehst, funktionieren deine Benachrichtigungen!",
        icon: "/icon.png", // Ensure the icon path is correct
        badge: "/badge.png", // Optional: for Android
        tag: "test-notification", // Prevents multiple test notifications from stacking
      });
    });

    toast({
      title: "Test-Benachrichtigung gesendet",
      description:
        "Du solltest in Kürze eine Benachrichtigung sehen. Wenn nicht, überprüfe deine Browser- und Betriebssystem-Einstellungen.",
    });
  };

  React.useEffect(() => {
    const loadContacts = async () => {
      const dbContacts = await getAllContacts();
      setContacts(dbContacts);
    };
    loadContacts();
  }, []);

  React.useEffect(() => {
    if (!isFormOpen) {
      setEditingContact(null);
    }
  }, [isFormOpen]);
  
  React.useEffect(() => {
    // Cleanup function to reset the contact to delete when the dialog is closed
    if (!isDeleteDialogOpen) {
      setContactToDeleteId(null);
    }
  }, [isDeleteDialogOpen]);

  const handleOpenForm = (contact: Contact | null = null) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleSaveContact = async (
    contactData: Omit<Contact, "id">,
    id?: string
  ) => {
    let contactToSave: Contact;
    if (id) {
      const existingContact = contacts.find((c) => c.id === id)!;
      contactToSave = { ...existingContact, ...contactData };
      setContacts(
        contacts.map((c) => (c.id === id ? contactToSave : c))
      );
      toast({
        title: "Kontakt aktualisiert",
        description: `Die Daten von ${contactData.name} wurden aktualisiert.`,
      });
    } else {
      contactToSave = { ...contactData, id: crypto.randomUUID() };
      setContacts((prev) => [...prev, contactToSave].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Kontakt hinzugefügt",
        description: `${contactData.name} wurde zu deiner Liste hinzugefügt.`,
      });
    }
    await saveContact(contactToSave);
    setIsFormOpen(false);
  };

  const promptDeleteContact = (id: string) => {
    setContactToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteContact = async () => {
    if (!contactToDeleteId) return;

    const contactToDelete = contacts.find((c) => c.id === contactToDeleteId);
    if (contactToDelete) {
      setContacts(contacts.filter((c) => c.id !== contactToDeleteId));
      await deleteContact(contactToDeleteId);
      toast({
        title: "Kontakt gelöscht",
        description: `${contactToDelete.name} wurde entfernt.`,
      });
    }

    setIsDeleteDialogOpen(false);
  };

  const handleExportData = async () => {
    try {
      const contactsToExport = await getAllContacts();
      const dataStr = JSON.stringify(contactsToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `remember-when-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Daten erfolgreich exportiert!" });
    } catch (error) {
      console.error("Fehler beim Exportieren der Daten", error);
      toast({ title: "Export fehlgeschlagen", variant: "destructive" });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string") {
          throw new Error("Datei ist nicht lesbar");
        }
        const importedContacts = JSON.parse(text) as Omit<Contact, 'birthday'> & { birthday: string }[];

        if (!Array.isArray(importedContacts)) {
          throw new Error("Ungültiges Backup-Dateiformat");
        }

        const contactsWithDateObjects: Contact[] = importedContacts.map(
          (c) => ({ ...c, birthday: new Date(c.birthday), id: c.id || crypto.randomUUID() })
        );

        await bulkAddContacts(contactsWithDateObjects);
        const allDbContacts = await getAllContacts();
        setContacts(allDbContacts.sort((a, b) => a.name.localeCompare(b.name)));
        
        toast({ title: "Daten erfolgreich importiert!", description: `${contactsWithDateObjects.length} Kontakte wurden hinzugefügt/aktualisiert.` });
        setIsSettingsOpen(false);
      } catch (error) {
        console.error("Fehler beim Importieren der Daten", error);
        toast({
          title: "Import fehlgeschlagen",
          description: "Bitte überprüfen Sie das Dateiformat.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    // Reset file input to allow importing the same file again
    if (event.target) {
        event.target.value = '';
    }
  };

  const contactAboutToBeDeleted = contacts.find(c => c.id === contactToDeleteId);

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
              <span className="hidden sm:inline sm:ml-2">Kontakt hinzufügen</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Einstellungen</span>
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
              <h2 className="font-headline text-2xl font-bold">Deine Kontakte</h2>
            </div>
            <ContactList
              contacts={contacts}
              onEdit={handleOpenForm}
              onDelete={promptDeleteContact}
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
        handleExportData={handleExportData}
        handleImportData={handleImportData}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
            <AlertDialogDescription>
              {contactAboutToBeDeleted
                ? `Möchten Sie den Kontakt "${contactAboutToBeDeleted.name}" wirklich löschen?`
                : "Möchten Sie diesen Kontakt wirklich löschen?"}{" "}
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteContact}
              className={buttonVariants({ variant: "destructive" })}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
