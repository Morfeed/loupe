import { AlertShowcase } from "./_components/alert-showcase"
import { ButtonGroupShowcase } from "./_components/button-group-showcase"
import { ButtonShowcase } from "./_components/button-showcase"
import { ChartShowcase } from "./_components/chart-showcase"
import { ChatShowcase } from "./_components/chat-showcase"
import { ColorTokens } from "./_components/color-tokens"
import { CommandShowcase } from "./_components/command-showcase"
import { DatePickerShowcase } from "./_components/date-picker-showcase"
import { DialogShowcase } from "./_components/dialog-showcase"
import { DropdownMenuShowcase } from "./_components/dropdown-menu-showcase"
import { EmptyShowcase } from "./_components/empty-showcase"
import { FormShowcase } from "./_components/form-showcase"
import { sectionIds, type SectionId } from "./_components/nav"
import { PaginationShowcase } from "./_components/pagination-showcase"
import { ProgressShowcase } from "./_components/progress-showcase"
import { QuestionnaireShowcase } from "./_components/questionnaire-showcase"
import { RadiusShowcase } from "./_components/radius-showcase"
import { Section } from "./_components/section"
import { SeparatorShowcase } from "./_components/separator-showcase"
import { ShadowShowcase } from "./_components/shadow-showcase"
import { SheetShowcase } from "./_components/sheet-showcase"
import { SkeletonShowcase } from "./_components/skeleton-showcase"
import { TableShowcase } from "./_components/table-showcase"
import { TabsShowcase } from "./_components/tabs-showcase"
import { ToastShowcase } from "./_components/toast-showcase"
import { ToggleShowcase } from "./_components/toggle-showcase"
import { TooltipShowcase } from "./_components/tooltip-showcase"
import { TypographyScale } from "./_components/typography-scale"

// Page order follows navGroups in nav.ts, so the sidebar and page never drift.
const showcases: Record<SectionId, React.ComponentType> = {
  colors: ColorTokens,
  typography: TypographyScale,
  radius: RadiusShowcase,
  shadow: ShadowShowcase,
  alert: AlertShowcase,
  buttons: ButtonShowcase,
  "button-group": ButtonGroupShowcase,
  charts: ChartShowcase,
  command: CommandShowcase,
  "date-picker": DatePickerShowcase,
  dialog: DialogShowcase,
  "dropdown-menu": DropdownMenuShowcase,
  empty: EmptyShowcase,
  form: FormShowcase,
  pagination: PaginationShowcase,
  progress: ProgressShowcase,
  separator: SeparatorShowcase,
  sheet: SheetShowcase,
  skeleton: SkeletonShowcase,
  table: TableShowcase,
  tabs: TabsShowcase,
  toast: ToastShowcase,
  toggle: ToggleShowcase,
  tooltip: TooltipShowcase,
  chat: ChatShowcase,
  questionnaire: QuestionnaireShowcase,
}

export default function DesignSystemPage() {
  return (
    <div
      id="top"
      className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-24 px-4 py-10 md:px-8 md:py-14"
    >
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs tracking-widest text-neutral-foreground uppercase">
          Morfeed · feed filtering extension
        </span>
        <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          Design system
        </h1>
        <p className="max-w-2xl text-neutral-foreground">
          The tokens and components behind Morfeed, the extension that reads
          your social feeds straight from the page and filters out toxicity,
          bots, AI slop and topics you never asked for. Everything below is
          rendered as it ships in components/ui. Press{" "}
          <kbd className="rounded-md border bg-neutral-background px-1.5 font-mono text-xs">
            d
          </kbd>{" "}
          to toggle the theme.
        </p>
      </div>

      {sectionIds.map((id) => {
        const Showcase = showcases[id]

        return (
          <Section key={id} id={id}>
            <Showcase />
          </Section>
        )
      })}
    </div>
  )
}
