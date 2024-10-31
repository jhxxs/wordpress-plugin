import React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"

interface DrawerProps {
  trigger?: React.ReactNode
  title: string
  children: React.ReactNode
}

const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  ({ trigger, title, children }) => (
    <Dialog.Root>
      <Dialog.Root>
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed right-0 top-0 h-full w-[300px] bg-white p-6 shadow-lg focus:outline-none">
            <Dialog.Title className="text-lg font-semibold">
              {title}
            </Dialog.Title>
            <div className="mt-4">{children}</div>
            <Dialog.Close asChild>
              <button
                className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100"
                aria-label="Close"
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Dialog.Root>
  )
)

export default Drawer
