"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  CopyIcon,
  CpuIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  RefreshCwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  time: string
  parts: string[]
}

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    time: "9:40 AM",
    parts: ["Why did you hide so many posts on X this morning?"],
  },
  {
    id: "m2",
    role: "assistant",
    time: "9:40 AM",
    parts: [
      "42 posts were filtered. 23 matched your “election hot takes” topic, 12 scored above your toxicity threshold of 70, and 7 came from accounts the bot detector flagged.",
      "Want to see the bot accounts?",
    ],
  },
  {
    id: "m3",
    role: "user",
    time: "9:41 AM",
    parts: ["Yes, the bots.", "Just the handles."],
  },
  {
    id: "m4",
    role: "assistant",
    time: "9:41 AM",
    parts: [
      "@crypto_gains_4u, @newsflash_bot, @trendwave_ai and 4 more. They posted near-identical replies within 30 seconds of each other, and all accounts are under two weeks old.",
    ],
  },
]

const cannedReplies = [
  "Done. Replies from those accounts are now muted on X and Reddit.",
  "I lowered the toxicity threshold to 60 for YouTube comments only.",
  "Exported today's 128 collected posts to JSON.",
]

function Bubble({
  role,
  children,
}: {
  role: ChatMessage["role"]
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="message-bubble"
      className={cn(
        "max-w-[85%] rounded-3xl px-3.5 py-2 leading-relaxed text-pretty",
        role === "user"
          ? "bg-brand-background text-brand-foreground"
          : "bg-neutral-background"
      )}
    >
      {children}
    </div>
  )
}

function Avatar({ role }: { role: ChatMessage["role"] }) {
  return (
    <MessageAvatar
      className={cn(
        "size-8 text-xs font-medium",
        role === "user" && "bg-brand-subtle text-brand-background"
      )}
    >
      {role === "user" ? "AM" : "MF"}
    </MessageAvatar>
  )
}

function ChatMessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <Message align={isUser ? "end" : "start"}>
      <Avatar role={message.role} />
      <MessageContent>
        <MessageHeader>
          {isUser ? "You" : "Loupe"} · {message.time}
        </MessageHeader>
        {message.parts.map((part) => (
          <Bubble key={part} role={message.role}>
            {part}
          </Bubble>
        ))}
        {isUser ? null : (
          <MessageFooter className="gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Copy"
              onClick={() =>
                navigator.clipboard
                  .writeText(message.parts.join("\n\n"))
                  .then(() => toast.add({ title: "Copied to clipboard" }))
              }
            >
              <CopyIcon />
            </Button>
            <Button variant="ghost" size="icon-xs" aria-label="Good answer">
              <ThumbsUpIcon />
            </Button>
            <Button variant="ghost" size="icon-xs" aria-label="Bad answer">
              <ThumbsDownIcon />
            </Button>
            <Button variant="ghost" size="icon-xs" aria-label="Regenerate">
              <RefreshCwIcon />
            </Button>
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  )
}

function TypingIndicator() {
  return (
    <Message>
      <Avatar role="assistant" />
      <MessageContent>
        <div
          data-slot="message-bubble"
          className="flex w-fit items-center gap-2 rounded-3xl bg-neutral-background px-3.5 py-2 text-neutral-foreground"
        >
          <Spinner className="size-3.5" />
          Checking your feed…
        </div>
      </MessageContent>
    </Message>
  )
}

function ChatCard() {
  const [messages, setMessages] = React.useState(initialMessages)
  const [draft, setDraft] = React.useState("")
  const [isReplying, setIsReplying] = React.useState(false)
  const replyTimeout = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(replyTimeout.current), [])

  function sendMessage() {
    const content = draft.trim()
    if (!content || isReplying) {
      return
    }

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", time: "Now", parts: [content] },
    ])
    setDraft("")
    setIsReplying(true)

    replyTimeout.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          time: "Now",
          parts: [cannedReplies[current.length % cannedReplies.length]],
        },
      ])
      setIsReplying(false)
    }, 1200)
  }

  return (
    <Card className="h-[40rem] gap-0 py-0">
      <CardHeader className="border-b py-4 [.border-b]:pb-4">
        <CardTitle>Feed assistant</CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand-background" />
          Llama 3.2 3B · running locally
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Conversation options"
          >
            <MoreHorizontalIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="flex-1">
          <MessageScrollerViewport className="px-6" aria-label="Conversation">
            <MessageScrollerContent className="py-6">
              <MessageScrollerItem>
                <Marker variant="separator">
                  <MarkerContent>Today</MarkerContent>
                </Marker>
              </MessageScrollerItem>
              {messages.map((message) => (
                <MessageScrollerItem
                  key={message.id}
                  messageId={message.id}
                  scrollAnchor={message.role === "user"}
                >
                  <ChatMessageItem message={message} />
                </MessageScrollerItem>
              ))}
              {isReplying ? (
                <MessageScrollerItem>
                  <TypingIndicator />
                </MessageScrollerItem>
              ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
      <CardFooter className="border-t py-4 [.border-t]:pt-4">
        <form
          className="w-full"
          onSubmit={(event) => {
            event.preventDefault()
            sendMessage()
          }}
        >
          <InputGroup>
            <InputGroupTextarea
              aria-label="Message"
              placeholder="Ask about what was filtered, or change a rule…"
              className="max-h-40"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault()
                  sendMessage()
                }
              }}
            />
            <InputGroupAddon align="block-end">
              <InputGroupButton
                variant="outline"
                size="icon-xs"
                className="rounded-full"
                aria-label="Attach collected posts"
              >
                <PaperclipIcon />
              </InputGroupButton>
              <InputGroupText className="ml-auto text-xs font-normal">
                Enter to send
              </InputGroupText>
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-xs"
                className="rounded-full"
                aria-label="Send message"
                disabled={!draft.trim() || isReplying}
              >
                <ArrowUpIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </CardFooter>
    </Card>
  )
}

function MessageVariantsCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Message variants</CardTitle>
        <CardDescription>
          Alignment, grouping, ghost and markers.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Marker variant="border">
          <MarkerIcon>
            <CpuIcon />
          </MarkerIcon>
          <MarkerContent>Answers are generated on your device.</MarkerContent>
        </Marker>
        <MessageGroup>
          <Message align="end">
            <MessageContent>
              <Bubble role="user">Hide crypto giveaways</Bubble>
            </MessageContent>
          </Message>
          <Message align="end">
            <MessageContent>
              <Bubble role="user">On every platform</Bubble>
            </MessageContent>
          </Message>
        </MessageGroup>
        <Message>
          <Avatar role="assistant" />
          <MessageContent>
            <MessageHeader>Loupe</MessageHeader>
            <Bubble role="assistant">
              Rule created and applied to 5 platforms.
            </Bubble>
          </MessageContent>
        </Message>
        <Message>
          <MessageContent>
            <div
              data-slot="message-bubble"
              data-variant="ghost"
              className="leading-relaxed"
            >
              <MessageHeader>Weekly summary</MessageHeader>
              <p className="mt-1">
                You scrolled past 12,020 posts. 1,622 were filtered, mostly
                AI-generated content on LinkedIn and toxic replies on X.
              </p>
            </div>
          </MessageContent>
        </Message>
        <Marker variant="separator">
          <MarkerContent>
            Rule &ldquo;Calm timeline&rdquo; updated
          </MarkerContent>
        </Marker>
        <TypingIndicator />
      </CardContent>
    </Card>
  )
}

export function ChatShowcase() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <ChatCard />
      <MessageVariantsCard />
    </div>
  )
}
