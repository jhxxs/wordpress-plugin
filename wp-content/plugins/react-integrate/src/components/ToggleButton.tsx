import { forwardRef, useState } from "react"

type ToggleButtonProps<T extends boolean> = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  defaultChecked?: boolean
  /** 禁用切换 */
  disableToggle?: T
  children?: React.ReactNode
  onClick?: T extends true ? ClickEvent : ToogleEvent
}

type ClickEvent = React.MouseEventHandler<HTMLButtonElement> | undefined
type ToogleEvent = (checked: boolean) => void

const ToggleButtonInner = <T extends boolean = false>(
  {
    defaultChecked,
    children,
    disableToggle,
    onClick,
    ...props
  }: ToggleButtonProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <button
      {...props}
      ref={ref}
      className={clsx(
        "size-40px flex items-center justify-center rounded-5px text-20px",
        checked ? "bg-#dbf2fa text-#1164a9" : "hover:bg-#e5e5e5",
        props.className
      )}
      onClick={(e) => {
        if (disableToggle) {
          ;(onClick as ClickEvent)?.(e)
        } else {
          // console.log("disableToggle", checked)
          setChecked(!checked)
          ;(onClick as ToogleEvent)?.(!checked)
        }
      }}
    >
      {children}
    </button>
  )
}

const ToggleButton = forwardRef(ToggleButtonInner) as <
  T extends boolean = false
>(
  props: ToggleButtonProps<T> & { ref?: React.ForwardedRef<HTMLButtonElement> }
) => ReturnType<typeof ToggleButtonInner>

export default ToggleButton
