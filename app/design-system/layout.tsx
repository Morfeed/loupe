import type { Metadata } from "next"

import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toast"

import { DesignSystemSidebar } from "./_components/design-system-sidebar"
import { ThemeToggle } from "./_components/theme-toggle"

export const metadata: Metadata = {
  title: "Design system",
  description: "Tokens and components that make up the Loupe interface.",
}

export default function DesignSystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Toaster>
      <SidebarProvider>
        <DesignSystemSidebar />
        <SidebarInset className="min-w-0 bg-dashboard-background">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-1 data-vertical:h-4 data-vertical:self-center"
            />
            <span className="text-sm font-medium">Design system</span>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </Toaster>
  )
}
