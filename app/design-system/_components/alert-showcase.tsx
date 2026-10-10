import { CircleAlertIcon, CpuIcon, InfoIcon } from "lucide-react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

import { Subsection } from "./section"

export function AlertShowcase() {
  return (
    <Subsection className="grid gap-4 md:grid-cols-2">
      <Alert>
        <InfoIcon />
        <AlertTitle>X changed its page markup</AlertTitle>
        <AlertDescription>
          Some filters may miss posts until the next selector update ships.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>API key rejected</AlertTitle>
        <AlertDescription>
          Your provider returned 401. Update the key in Settings → Models.
        </AlertDescription>
      </Alert>
      <Alert>
        <CpuIcon />
        <AlertTitle>Local model ready</AlertTitle>
        <AlertDescription>
          Llama 3.2 3B is running in Ollama. Classify posts without sending them
          anywhere.
        </AlertDescription>
        <AlertAction>
          <Button size="xs">Use it</Button>
        </AlertAction>
      </Alert>
      <Alert>
        <AlertTitle>Auto-click is paused</AlertTitle>
        <AlertDescription>
          Loupe stopped clicking &ldquo;Not interested&rdquo; after hitting
          the hourly limit.
        </AlertDescription>
      </Alert>
    </Subsection>
  )
}
