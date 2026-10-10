"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import { toast } from "@/components/ui/toast"

const platforms = [
  {
    value: "x",
    label: "X",
    description: "Fast replies, quote posts and trending threads.",
  },
  {
    value: "reddit",
    label: "Reddit",
    description: "Long comment chains and niche communities.",
  },
  {
    value: "youtube",
    label: "YouTube",
    description: "Recommendations and comment sections.",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    description: "Professional posts and engagement bait.",
  },
]

const filterTargets = [
  { value: "toxicity", label: "Toxic and hateful replies", disabled: false },
  { value: "bots", label: "Bot and spam accounts", disabled: false },
  { value: "ai", label: "AI-generated content", disabled: false },
  { value: "bait", label: "Engagement and rage bait", disabled: false },
  {
    value: "deepfakes",
    label: "Deepfake images (coming soon)",
    disabled: true,
  },
]

const modelChoices = [
  { value: "local", label: "Local model (private, free)" },
  { value: "byok", label: "My own API key" },
  { value: "browser", label: "In-browser model (no setup)" },
]

function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()
  toast.add({
    type: "success",
    title: "Filters personalized",
    description: "Loupe will apply them the next time you open your feed.",
  })
}

function OnboardingQuestionnaire() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up your filters</CardTitle>
        <CardDescription>
          Single choice, multiple choice and free text with letter shortcuts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Questionnaire shortcuts="letters" onSubmit={handleSubmit}>
          <QuestionnaireProgress />
          <QuestionnaireItem name="platform" required>
            <QuestionnaireTitle>
              Where do you scroll the most?
            </QuestionnaireTitle>
            <QuestionnaireDescription>
              We&apos;ll tune the defaults for this platform first.
            </QuestionnaireDescription>
            <QuestionnaireChoices>
              {platforms.map((platform) => (
                <QuestionnaireChoice
                  key={platform.value}
                  value={platform.value}
                >
                  {platform.label}
                  <QuestionnaireChoiceDescription>
                    {platform.description}
                  </QuestionnaireChoiceDescription>
                </QuestionnaireChoice>
              ))}
            </QuestionnaireChoices>
            <QuestionnaireError>
              Pick a platform to continue.
            </QuestionnaireError>
          </QuestionnaireItem>
          <QuestionnaireItem name="targets" multiple>
            <QuestionnaireTitle>
              What should Loupe filter out?
            </QuestionnaireTitle>
            <QuestionnaireDescription>
              Select all that apply.
            </QuestionnaireDescription>
            <QuestionnaireChoices>
              {filterTargets.map((target) => (
                <QuestionnaireChoice
                  key={target.value}
                  value={target.value}
                  disabled={target.disabled}
                >
                  {target.label}
                </QuestionnaireChoice>
              ))}
            </QuestionnaireChoices>
          </QuestionnaireItem>
          <QuestionnaireItem name="topics">
            <QuestionnaireTitle>
              Any topics you never want to see?
            </QuestionnaireTitle>
            <QuestionnaireInput placeholder="e.g. TV spoilers, crypto, celebrity drama" />
          </QuestionnaireItem>
          <QuestionnaireActions>
            <QuestionnairePrevious />
            <QuestionnaireSkip />
            <QuestionnaireNext />
            <QuestionnaireSubmit>Start filtering</QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      </CardContent>
    </Card>
  )
}

function ModelPollQuestionnaire() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Choose a model</CardTitle>
        <CardDescription>
          A single required question with number shortcuts and a neutral submit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Questionnaire shortcuts="numbers" onSubmit={handleSubmit}>
          <QuestionnaireItem name="model" required>
            <QuestionnaireTitle>
              What should classify your posts?
            </QuestionnaireTitle>
            <QuestionnaireChoices>
              {modelChoices.map((choice) => (
                <QuestionnaireChoice key={choice.value} value={choice.value}>
                  {choice.label}
                </QuestionnaireChoice>
              ))}
            </QuestionnaireChoices>
            <QuestionnaireError>
              Pick how posts are classified.
            </QuestionnaireError>
          </QuestionnaireItem>
          <QuestionnaireActions>
            <QuestionnaireSubmit variant="outline">
              Save choice
            </QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      </CardContent>
    </Card>
  )
}

export function QuestionnaireShowcase() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <OnboardingQuestionnaire />
      <ModelPollQuestionnaire />
    </div>
  )
}
