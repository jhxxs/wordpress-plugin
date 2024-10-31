import { ComponentPropsWithoutRef } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

const Tooltip = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ children, className, ...props }, forwardedRef) => (
  <TooltipPrimitive.Provider>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        <>
          'deadae'
          {children}
        </>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className={clsx(
            "select-none rounded bg-white px-[15px] py-2.5 text-[15px] leading-none text-violet11 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity] data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade",
            className
          )}
          sideOffset={5}
          ref={forwardedRef}
          {...props}
        >
          Add to library
          <TooltipPrimitive.Arrow className="fill-white" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
))

export default Tooltip
