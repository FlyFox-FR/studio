"use client";

import * as React from "react";
import { Bell, TestTubeDiagonal, Download, Upload, Database, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "./ui/separator";
import { ThemeToggle } from "./theme-toggle";

interface SettingsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  notificationPermission: NotificationPermission;
  isSubscribed: boolean;
  handleRequestNotificationPermission: () => void;
  handleTestNotification: () => void;
  handleExportData: () => void;
  handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SettingsSheet({
  isOpen,
  onOpenChange,
  notificationPermission,
  isSubscribed,
  handleRequestNotificationPermission,
  handleTestNotification,
  handleExportData,
  handleImportData,
}: SettingsSheetProps) {
  const importInputRef = React.useRef<HTMLInputElement>(null);

  const renderNotificationUI = () => {
    if (notificationPermission === "denied") {
      return (
        <p className="text-sm text-destructive">
          Benachrichtigungen sind blockiert. Bitte aktiviere sie in deinen Browsereinstellungen.
        </p>
      );
    }

    if (isSubscribed) {
      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Benachrichtigungen sind aktiviert!
          </p>
          <Button variant="outline" onClick={handleTestNotification}>
            <TestTubeDiagonal className="mr-2 h-4 w-4" />
            Test-Benachrichtigung senden
          </Button>
        </div>
      );
    }

    return (
      <Button onClick={handleRequestNotificationPermission} disabled={notificationPermission === 'granted'}>
        {notificationPermission === 'granted' ? 'Melde an...' : 'Benachrichtigungen aktivieren'}
      </Button>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Einstellungen</SheetTitle>
          <SheetDescription>
            Verwalte hier deine Anwendungseinstellungen.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Erscheinungsbild</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Wähle das Farbschema für die Anwendung.
          </p>
          <ThemeToggle />
        </div>
        <Separator />
        <div className="py-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Benachrichtigungen</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Aktiviere Push-Benachrichtigungen, um Geburtstagserinnerungen zu erhalten. Dies funktioniert am besten auf Android.
          </p>
          {renderNotificationUI()}
        </div>
        <Separator />
        <div className="py-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Datensicherung</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Exportiere deine Kontakte als JSON-Datei oder importiere sie aus einem Backup.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Exportieren
            </Button>
            <Button
              variant="outline"
              onClick={() => importInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Importieren
            </Button>
            <input
              type="file"
              ref={importInputRef}
              className="hidden"
              accept="application/json"
              onChange={handleImportData}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
