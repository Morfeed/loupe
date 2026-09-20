"use client"

import * as React from "react"
import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { Preview, Subsection } from "./section"

function AlertDialogExample({ size }: { size: "default" | "sm" }) {
  const [open, setOpen] = React.useState(false)
  const isSmall = size === "sm"

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant={isSmall ? "destructive" : "outline"} />}
      >
        {isSmall ? "Delete collected data" : "Disconnect extension"}
      </AlertDialogTrigger>
      <AlertDialogContent size={size}>
        <AlertDialogHeader>
          {isSmall ? (
            <AlertDialogMedia className="bg-danger-subtle text-danger-background">
              <Trash2Icon />
            </AlertDialogMedia>
          ) : null}
          <AlertDialogTitle>
            {isSmall ? "Delete collected data?" : "Disconnect the extension?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSmall
              ? "All 12,480 posts collected from your feeds will be removed."
              : "Your feeds will stop being filtered on every browser. Rules and keys stay saved in your account."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={isSmall ? "destructive" : "default"}
            onClick={() => setOpen(false)}
          >
            {isSmall ? "Delete" : "Disconnect"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function DialogShowcase() {
  return (
    <Subsection className="grid gap-4 md:grid-cols-2">
      <Preview>
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            Edit filter rule
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit filter rule</DialogTitle>
              <DialogDescription>
                Changes apply to every open tab the next time the feed scrolls.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="dialog-rule-name">Rule name</FieldLabel>
                <Input id="dialog-rule-name" defaultValue="Calm timeline" />
              </Field>
              <Field>
                <FieldLabel htmlFor="dialog-rule-topics">Topics</FieldLabel>
                <Input
                  id="dialog-rule-topics"
                  defaultValue="election hot takes, crypto giveaways"
                />
              </Field>
            </FieldGroup>
            <DialogFooter showCloseButton>
              <Button>Save rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            Share rule set
          </DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Share rule set</DialogTitle>
              <DialogDescription>
                Anyone with this link can import your filters. API keys are
                never included.
              </DialogDescription>
            </DialogHeader>
            <Input readOnly defaultValue="https://morfeed.app/rules/8Xk2pQ" />
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>
      </Preview>
      <Preview>
        <AlertDialogExample size="default" />
        <AlertDialogExample size="sm" />
      </Preview>
    </Subsection>
  )
}
