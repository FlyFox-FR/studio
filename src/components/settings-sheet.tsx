"use client";

import * as React from "react";
import { Bell, TestTubeDiagonal, Download, Upload, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "./ui/separator";

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
          Notifications are blocked. Please enable them in your browser
          settings.
        </p>
      );
    }

    if (isSubscribed) {
      return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <p className="text-sm font-medium text-green-600">
            Notifications are enabled!
          </p>
          <Button variant="outline" onClick={handleTestNotification}>
            <TestTubeDiagonal className="mr-2 h-4 w-4" />
            Send Test Notification
          </Button>
        </div>
      );
    }

    return (
      <Button onClick={handleRequestNotificationPermission}>
        Enable Notifications
      </Button>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your application settings here.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Enable push notifications to get birthday reminders, even when the
            app is closed on Android.
          </p>
          {renderNotificationUI()}
        </div>
        <Separator />
        <div className="py-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Data Backup</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Export your contacts to a JSON file or import them from a backup.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => importInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
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
