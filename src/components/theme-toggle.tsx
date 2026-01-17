"use client"

import * as React from "react"
import { Laptop, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <RadioGroup
      value={theme}
      onValueChange={setTheme}
      className="grid grid-cols-3 gap-2 rounded-lg border p-2"
    >
      <div>
        <RadioGroupItem value="light" id="light" className="peer sr-only" />
        <Label
          htmlFor="light"
          className="flex h-9 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
        >
          <Sun className="h-4 w-4" />
          <span className="mt-1">Hell</span>
        </Label>
      </div>
      <div>
        <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
        <Label
          htmlFor="dark"
          className="flex h-9 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
        >
          <Moon className="h-4 w-4" />
          <span className="mt-1">Dunkel</span>
        </Label>
      </div>
      <div>
        <RadioGroupItem value="system" id="system" className="peer sr-only" />
        <Label
          htmlFor="system"
          className="flex h-9 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-muted bg-popover text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
        >
          <Laptop className="h-4 w-4" />
          <span className="mt-1">System</span>
        </Label>
      </div>
    </RadioGroup>
  )
}
