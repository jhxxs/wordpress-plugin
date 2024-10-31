import * as Accordion from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "@radix-ui/themes"
import clsx from "clsx"
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react"

const AccordionDemo = () => (
  <Accordion.Root
    className="w-[300px] rounded-md bg-mauve6 shadow-[0_2px_10px] shadow-black/5"
    type="single"
    defaultValue="item-1"
    collapsible
  >
    <AccordionItem value="item-1">
      <AccordionTrigger>Is it accessible?</AccordionTrigger>
      <AccordionContent>
        Yes. It adheres to the WAI-ARIA design pattern.
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="item-2">
      <AccordionTrigger>Is it unstyled?</AccordionTrigger>
      <AccordionContent>
        Yes. It's unstyled by default, giving you freedom over the look and
        feel.
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="item-3">
      <AccordionTrigger>Can it be animated?</AccordionTrigger>
      <AccordionContent>
        Yes! You can animate the Accordion with CSS or JavaScript.
      </AccordionContent>
    </AccordionItem>
  </Accordion.Root>
)

const AccordionItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Accordion.Item>
>(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Item
    className={clsx(
      "mt-px overflow-hidden first:mt-0 first:rounded-t last:rounded-b focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px] focus-within:shadow-mauve12",
      className
    )}
    {...props}
    ref={forwardedRef}
  >
    {children}
  </Accordion.Item>
))

const AccordionTrigger = forwardRef<
  ElementRef<typeof Accordion.Trigger>,
  ComponentPropsWithoutRef<typeof Accordion.Trigger>
>(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Header className="flex">
    <Accordion.Trigger
      className={clsx(
        "group flex h-[45px] flex-1 cursor-default items-center justify-between bg-white px-5 text-[15px] leading-none text-violet11 shadow-[0_1px_0] shadow-mauve6 outline-none hover:bg-mauve2",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
      <ChevronDownIcon
        className="text-violet10 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
        aria-hidden
      />
    </Accordion.Trigger>
  </Accordion.Header>
))

const AccordionContent = forwardRef<
  ElementRef<typeof Accordion.Content>,
  ComponentPropsWithoutRef<typeof Accordion.Content>
>(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Content
    className={clsx(
      "overflow-hidden bg-mauve2 text-[15px] text-mauve11 data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown",
      className
    )}
    {...props}
    ref={forwardedRef}
  >
    <div className="px-5 py-[15px]">{children}</div>
  </Accordion.Content>
))

export default AccordionDemo
