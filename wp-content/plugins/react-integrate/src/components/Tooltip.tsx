import {
  Tooltip as RadixTooltip,
  TooltipProps as RadixTooltipProps
} from "@radix-ui/themes"

interface TooltipProps extends RadixTooltipProps {
  disabled?: boolean
}

export default function Tooltip({
  disabled,
  children,
  content,
  ...props
}: TooltipProps) {
  if (disabled) return children
  return (
    <RadixTooltip
      sideOffset={10}
      delayDuration={10}
      content={
        <span className="px-8px py-12px text-16px block">{content}</span>
      }
      {...props}
    >
      {children}
    </RadixTooltip>
  )
}
