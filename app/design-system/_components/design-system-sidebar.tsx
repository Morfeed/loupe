"use client"

import * as React from "react"
import { SwatchBookIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

import { navGroups, sectionIds, sections, type SectionId } from "./nav"

function useActiveSection() {
  const [active, setActive] = React.useState<SectionId>(sectionIds[0])

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        const id = sectionIds.find(
          (sectionId) => sectionId === visible?.target.id
        )
        if (id) {
          setActive(id)
        }
      },
      { rootMargin: "-20% 0px -75% 0px" }
    )

    for (const id of sectionIds) {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    }

    return () => observer.disconnect()
  }, [])

  return active
}

export function DesignSystemSidebar() {
  const active = useActiveSection()
  const { isMobile, setOpenMobile } = useSidebar()

  function handleNavigate() {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<a href="#top" />}
              onClick={handleNavigate}
            >
              <div className="flex size-8 items-center justify-center rounded-xl bg-brand-background text-brand-foreground">
                <SwatchBookIcon />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium">Loupe</span>
                <span className="truncate text-xs">Design system</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((id) => {
                  const { title, icon: Icon } = sections[id]

                  return (
                    <SidebarMenuItem key={id}>
                      <SidebarMenuButton
                        isActive={active === id}
                        tooltip={title}
                        render={<a href={`#${id}`} />}
                        onClick={handleNavigate}
                      >
                        <Icon />
                        <span>{title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
