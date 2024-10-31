import * as Dialog from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"

interface FullscreenMockupProps extends Dialog.DialogProps {
  children?: React.ReactNode
}

const FullscreenMockup: React.FC<FullscreenMockupProps> = ({
  open,
  children,
  ...props
}) => {
  return (
    <Dialog.Root open={open} {...props}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-blackA6 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed z-99999 left-1/2 top-1/2 w-100vw h-100vh -translate-x-1/2 -translate-y-1/2  bg-white p-[25px] focus:outline-none data-[state=open]:animate-contentShow">
          <Dialog.Title className="m-0 text-[17px] font-medium text-mauve12">
            Edit profile
          </Dialog.Title>
          <Dialog.Description className="mb-5 mt-2.5 text-[15px] leading-normal text-mauve11">
            Make changes to your profile here. Click save when you're done.
          </Dialog.Description>
          <div className="mt-[32px] text-center">hello</div>
          <Dialog.Close asChild>
            <button
              className="absolute right-2.5 top-2.5 inline-flex size-[32px] appearance-none items-center justify-center rounded-full text-violet11 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
              aria-label="Close"
            >
              <Cross2Icon className="size-20px" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default FullscreenMockup
