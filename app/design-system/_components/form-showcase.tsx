"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  CalendarIcon,
  CpuIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  KeyRoundIcon,
  MoreHorizontalIcon,
  ServerIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

const providerGroups = [
  {
    label: "Bring your own key",
    providers: [
      { label: "Anthropic", value: "anthropic" },
      { label: "OpenAI", value: "openai" },
      { label: "Google Gemini", value: "gemini" },
      { label: "OpenRouter", value: "openrouter" },
    ],
  },
  {
    label: "Local",
    providers: [
      { label: "Ollama", value: "ollama" },
      { label: "LM Studio", value: "lmstudio" },
    ],
  },
  {
    label: "In-browser",
    providers: [{ label: "WebLLM", value: "webllm" }],
  },
]

const providerItems = providerGroups.flatMap((group) => group.providers)

const filterActions = [
  {
    value: "hide",
    title: "Hide",
    description: "Remove the post from the feed entirely.",
  },
  {
    value: "blur",
    title: "Blur",
    description: "Keep it in place behind a reveal button.",
  },
  {
    value: "label",
    title: "Label",
    description: "Show a badge with the reason it matched.",
  },
]

const platformOptions = [
  { id: "x", label: "X", defaultChecked: true },
  { id: "reddit", label: "Reddit", defaultChecked: true },
  { id: "youtube", label: "YouTube comments", defaultChecked: false },
]

const promptLimit = 280

function DatePicker({ id }: { id: string }) {
  const [date, setDate] = React.useState<Date>()
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button id={id} variant="field" className="w-full justify-start" />
        }
      >
        <CalendarIcon data-icon="inline-start" />
        {date ? (
          format(date, "PPP")
        ) : (
          <span className="text-neutral-foreground">Keep filtering</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selected) => {
            setDate(selected)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

function FilterRuleFormCard() {
  const [showKey, setShowKey] = React.useState(false)
  const [prompt, setPrompt] = React.useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.add({
      type: "success",
      title: "Rule saved",
      description: "Loupe will apply it the next time your feed loads.",
    })
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>New filter rule</CardTitle>
        <CardDescription>
          Choose a model, what to catch and what happens to matching posts.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Rule options">
            <MoreHorizontalIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form
          id="filter-rule-form"
          onSubmit={handleSubmit}
          onReset={() => setPrompt("")}
        >
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Model</FieldLegend>
              <FieldDescription>
                Use your own API key or a model running on your machine. Posts
                never pass through Loupe servers.
              </FieldDescription>
              <FieldGroup>
                <div className="grid gap-7 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="rule-name">Rule name</FieldLabel>
                    <Input
                      id="rule-name"
                      placeholder="Calm timeline"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="rule-provider">Provider</FieldLabel>
                    <Select items={providerItems} defaultValue="ollama">
                      <SelectTrigger id="rule-provider" className="w-full">
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providerGroups.map((group, index) => (
                          <React.Fragment key={group.label}>
                            {index > 0 ? <SelectSeparator /> : null}
                            <SelectGroup>
                              <SelectLabel>{group.label}</SelectLabel>
                              {group.providers.map((provider) => (
                                <SelectItem
                                  key={provider.value}
                                  value={provider.value}
                                >
                                  {provider.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </React.Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="grid gap-7 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="rule-api-key">API key</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <KeyRoundIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="rule-api-key"
                        type={showKey ? "text" : "password"}
                        defaultValue="sk-ant-api03-demo-key"
                        autoComplete="off"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          size="icon-xs"
                          aria-label={showKey ? "Hide API key" : "Show API key"}
                          onClick={() => setShowKey((current) => !current)}
                        >
                          {showKey ? <EyeOffIcon /> : <EyeIcon />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Encrypted and stored in the extension only.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="rule-endpoint">
                      Local endpoint
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <ServerIcon />
                        <InputGroupText>http://</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="rule-endpoint"
                        placeholder="localhost:11434"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>/api</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                </div>
                <div className="grid gap-7 sm:grid-cols-2">
                  <Field data-invalid="true">
                    <FieldLabel htmlFor="rule-model">Model</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <CpuIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="rule-model"
                        defaultValue="llama3.2:70b"
                        aria-invalid
                      />
                    </InputGroup>
                    <FieldError>
                      This model isn&apos;t pulled in Ollama yet.
                    </FieldError>
                  </Field>
                  <Field data-disabled="true">
                    <FieldLabel htmlFor="rule-extension-id">
                      Extension ID
                    </FieldLabel>
                    <Input
                      id="rule-extension-id"
                      defaultValue="mfd_ext_8Xk2pQ"
                      disabled
                    />
                    <FieldDescription>Paired automatically.</FieldDescription>
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>What to catch</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="rule-topics">
                    Topics to filter
                  </FieldLabel>
                  <Textarea
                    id="rule-topics"
                    placeholder={
                      "election hot takes\ncrypto giveaways\nTV spoilers"
                    }
                  />
                  <FieldDescription>
                    One topic per line. Matched by meaning, not just keywords.{" "}
                    <a href="#form">See examples</a>
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="rule-prompt">
                    Custom classifier prompt
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      id="rule-prompt"
                      placeholder="Hide posts that exist only to farm engagement…"
                      maxLength={promptLimit}
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="text-xs tabular-nums">
                        {prompt.length}/{promptLimit}
                      </InputGroupText>
                      <InputGroupButton
                        variant="ghost"
                        className="ml-auto"
                        onClick={() => setPrompt("")}
                      >
                        Clear
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
                <Field>
                  <FieldTitle>Toxicity threshold</FieldTitle>
                  <Slider defaultValue={[70]} aria-label="Toxicity threshold" />
                  <FieldDescription>
                    Posts scoring above this level are filtered.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldTitle>AI-content confidence</FieldTitle>
                  <Slider
                    defaultValue={[60, 90]}
                    aria-label="AI-content confidence range"
                  />
                  <FieldDescription>
                    Label posts inside the range, hide posts above it.
                  </FieldDescription>
                </Field>
                <Field data-disabled="true">
                  <FieldTitle>Bot score threshold</FieldTitle>
                  <Slider
                    defaultValue={[85]}
                    disabled
                    aria-label="Bot score threshold"
                  />
                  <FieldDescription>
                    Turn on the bot detector to adjust.
                  </FieldDescription>
                </Field>
                <div className="grid gap-7 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="rule-import">
                      Import rule set
                    </FieldLabel>
                    <Input id="rule-import" type="file" accept=".json" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="rule-pause">Pause until</FieldLabel>
                    <DatePicker id="rule-pause" />
                  </Field>
                </div>
                <Field orientation="responsive">
                  <FieldContent>
                    <FieldLabel htmlFor="rule-batch">
                      Posts per batch
                    </FieldLabel>
                    <FieldDescription>
                      How many posts are sent to the model at once.
                    </FieldDescription>
                  </FieldContent>
                  <Input
                    id="rule-batch"
                    type="number"
                    min={1}
                    max={100}
                    defaultValue={20}
                    className="sm:max-w-32"
                  />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator>Action</FieldSeparator>

            <FieldSet>
              <FieldLegend variant="label">When a post matches</FieldLegend>
              <FieldDescription>
                Choice cards built from FieldLabel.
              </FieldDescription>
              <RadioGroup defaultValue="blur" className="sm:grid-cols-3">
                {filterActions.map((action) => (
                  <FieldLabel
                    key={action.value}
                    htmlFor={`action-${action.value}`}
                  >
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>{action.title}</FieldTitle>
                        <FieldDescription>
                          {action.description}
                        </FieldDescription>
                      </FieldContent>
                      <RadioGroupItem
                        value={action.value}
                        id={`action-${action.value}`}
                      />
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
            </FieldSet>

            <div className="grid gap-7 sm:grid-cols-2">
              <FieldSet>
                <FieldLegend variant="label">Apply to</FieldLegend>
                <RadioGroup defaultValue="selected">
                  <Field orientation="horizontal">
                    <RadioGroupItem value="all" id="scope-all" />
                    <FieldLabel htmlFor="scope-all" className="font-normal">
                      All supported platforms
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <RadioGroupItem value="selected" id="scope-selected" />
                    <FieldLabel
                      htmlFor="scope-selected"
                      className="font-normal"
                    >
                      Selected platforms
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal" data-disabled="true">
                    <RadioGroupItem value="tab" id="scope-tab" disabled />
                    <FieldLabel htmlFor="scope-tab" className="font-normal">
                      Current tab only
                    </FieldLabel>
                  </Field>
                </RadioGroup>
              </FieldSet>
              <FieldSet>
                <FieldLegend variant="label">Platforms</FieldLegend>
                <FieldGroup data-slot="checkbox-group">
                  {platformOptions.map((option) => (
                    <Field key={option.id} orientation="horizontal">
                      <Checkbox
                        id={`platform-${option.id}`}
                        defaultChecked={option.defaultChecked}
                      />
                      <FieldLabel
                        htmlFor={`platform-${option.id}`}
                        className="font-normal"
                      >
                        {option.label}
                      </FieldLabel>
                    </Field>
                  ))}
                  <Field orientation="horizontal" data-disabled="true">
                    <Checkbox id="platform-tiktok" disabled />
                    <FieldLabel
                      htmlFor="platform-tiktok"
                      className="font-normal"
                    >
                      TikTok (coming soon)
                    </FieldLabel>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </div>

            <FieldSeparator />

            <FieldGroup>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="rule-auto-click">
                    Auto-click &ldquo;Not interested&rdquo;
                  </FieldLabel>
                  <FieldDescription>
                    Teaches the platform&apos;s algorithm while Loupe filters.
                  </FieldDescription>
                </FieldContent>
                <Switch id="rule-auto-click" defaultChecked />
              </Field>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="rule-expand">
                    Expand truncated posts
                  </FieldLabel>
                  <FieldDescription>
                    Clicks &ldquo;Show more&rdquo; so the full text is
                    classified.
                  </FieldDescription>
                </FieldContent>
                <Switch id="rule-expand" size="sm" />
              </Field>
              <Field orientation="horizontal" data-disabled="true">
                <FieldContent>
                  <FieldLabel htmlFor="rule-collect">
                    Save matched posts
                  </FieldLabel>
                  <FieldDescription>
                    Turn on data collection in Privacy settings first.
                  </FieldDescription>
                </FieldContent>
                <Switch id="rule-collect" disabled />
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="rule-consent" aria-invalid />
                <FieldContent>
                  <FieldLabel htmlFor="rule-consent">
                    I understand auto-click acts on my behalf
                  </FieldLabel>
                  <FieldDescription>
                    Required while auto-click is enabled.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t">
        <Button type="reset" form="filter-rule-form" variant="outline">
          Reset
        </Button>
        <Button type="submit" form="filter-rule-form">
          Save rule
        </Button>
      </CardFooter>
    </Card>
  )
}

function SignInCard() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.add({ type: "success", title: "Extension paired" })
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Sign in to sync</CardTitle>
        <CardDescription>
          Keep rules and muted authors in sync across browsers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <Label htmlFor="login-password">Password</Label>
                <a
                  href="#form"
                  className="ml-auto text-sm text-neutral-foreground underline-offset-4 hover:underline"
                >
                  Forgot?
                </a>
              </div>
              <Input id="login-password" type="password" />
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="login-remember" />
              <FieldLabel htmlFor="login-remember" className="font-normal">
                Pair this browser&apos;s extension
              </FieldLabel>
            </Field>
            <Field>
              <Button type="submit">Sign in</Button>
            </Field>
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card-background">
              or
            </FieldSeparator>
            <Field>
              <Button type="button" variant="outline">
                <GlobeIcon data-icon="inline-start" />
                Use without an account
              </Button>
              <FieldDescription className="text-center">
                Rules stay local. <a href="#form">What syncs?</a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export function FormShowcase() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <FilterRuleFormCard />
      <div className="flex flex-col gap-6 lg:sticky lg:top-20">
        <SignInCard />
      </div>
    </div>
  )
}
