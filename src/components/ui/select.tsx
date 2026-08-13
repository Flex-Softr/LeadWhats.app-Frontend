"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

type SelectItems = NonNullable<
  SelectPrimitive.Root.Props<string>["items"]
>

type SelectRegisterContextValue = {
  registerItem: (value: string, label: React.ReactNode) => void
}

const SelectRegisterContext =
  React.createContext<SelectRegisterContextValue | null>(null)

/** Flatten SelectItem children into a stable text key for change detection. */
function labelText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(labelText).join("")
  if (React.isValidElement(node)) {
    return labelText(
      (node.props as { children?: React.ReactNode }).children
    )
  }
  return ""
}

/**
 * Base UI Select shows the raw `value` (often a UUID) unless `items` maps
 * value → label. We auto-build `items` from SelectItem children so triggers
 * always show a human-readable label.
 */
function Select<
  Value = string,
  Multiple extends boolean | undefined = false,
>({
  items: itemsProp,
  children,
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
  const itemsRef = React.useRef<Record<string, React.ReactNode>>({})
  const [autoItems, setAutoItems] = React.useState<
    Record<string, React.ReactNode>
  >({})
  const bumpScheduled = React.useRef(false)

  const flushAutoItems = React.useCallback(() => {
    bumpScheduled.current = false
    setAutoItems({ ...itemsRef.current })
  }, [])

  const registerItem = React.useCallback(
    (value: string, label: React.ReactNode) => {
      const prev = itemsRef.current[value]
      if (prev !== undefined && labelText(prev) === labelText(label)) {
        return
      }
      itemsRef.current = { ...itemsRef.current, [value]: label }
      if (!bumpScheduled.current) {
        bumpScheduled.current = true
        queueMicrotask(flushAutoItems)
      }
    },
    [flushAutoItems]
  )

  const items = React.useMemo(() => {
    if (itemsProp !== undefined) return itemsProp
    if (Object.keys(autoItems).length === 0) return undefined
    return autoItems as SelectItems
  }, [itemsProp, autoItems])

  return (
    <SelectRegisterContext.Provider value={{ registerItem }}>
      <SelectPrimitive.Root items={items} {...props}>
        {children}
      </SelectPrimitive.Root>
    </SelectRegisterContext.Provider>
  )
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn(
        "flex flex-1 truncate text-left text-sm font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group/trigger flex w-full cursor-pointer items-center justify-between gap-2 border border-transparent bg-muted text-sm font-medium text-foreground transition-colors outline-none select-none",
        "hover:bg-muted/80",
        "focus-visible:border-border focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "data-placeholder:text-muted-foreground",
        "dark:bg-input/40 dark:hover:bg-input/55 dark:focus-visible:bg-card",
        "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        "data-[size=default]:h-11 data-[size=default]:rounded-xl data-[size=default]:px-3.5 data-[size=default]:py-2",
        "data-[size=sm]:h-8 data-[size=sm]:rounded-lg data-[size=sm]:px-2.5",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[popup-open]/trigger:rotate-180" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  /** Default false: open below the trigger like a normal dropdown (not overlaid). */
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-[400]"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "relative isolate z-[400] max-h-(--available-height) w-(--anchor-width) min-w-[var(--anchor-width)] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-xl ring-1 ring-black/5 duration-100 dark:ring-white/10",
            "data-[align-trigger=true]:animate-none",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="outline-none">
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  value,
  ...props
}: SelectPrimitive.Item.Props) {
  const ctx = React.useContext(SelectRegisterContext)

  // Register during render so labels are available ASAP (Base UI needs `items`).
  if (ctx && value != null && String(value) !== "") {
    ctx.registerItem(String(value), children)
  }

  React.useLayoutEffect(() => {
    if (!ctx || value == null) return
    const key = String(value)
    if (!key) return
    ctx.registerItem(key, children)
  }, [ctx, value, children])

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      value={value}
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2.5 pr-9 pl-2.5 text-sm outline-hidden select-none",
        "text-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        "data-[selected]:bg-accent/70 data-[selected]:font-medium",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex min-w-0 flex-1 gap-2 text-left whitespace-normal break-words">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2.5 flex size-4 items-center justify-center text-foreground" />
        }
      >
        <CheckIcon className="pointer-events-none size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
