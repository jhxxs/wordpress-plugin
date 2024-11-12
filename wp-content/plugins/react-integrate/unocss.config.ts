import { mauve, violet, blackA, green } from "@radix-ui/colors"
import { defineConfig, presetWind } from "unocss"
import { TailwindTheme } from "tailwindcss/tailwind-config"

const animationsd: Omit<TailwindTheme, "extend"> = {
  keyframes: {
    slideDown: {
      from: { height: "0px" },
      to: { height: "var(--radix-accordion-content-height)" }
    },
    slideUp: {
      from: { height: "var(--radix-accordion-content-height)" },
      to: { height: "0px" }
    }
  },
  animation: {
    slideDown: "slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)",
    slideUp: "slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)"
  }
}

export default defineConfig({
  presets: [presetWind()],
  shortcuts: {
    "squared-bg": [
      "bg-[linear-gradient(45deg,#f1f1f1_25%,transparent_0),linear-gradient(135deg,#f1f1f1_25%,transparent_0),linear-gradient(45deg,transparent_75%,#f1f1f1_0),linear-gradient(135deg,transparent_75%,#f1f1f1_0)]",
      "bg-[length:24px_24px]",
      "bg-[position:0_0,12px_0,12px_-12px,0_12px]"
    ].join(" ")
  },
  theme: {
    colors: {
      ...mauve,
      ...violet,
      ...green,
      ...blackA
    },
    animation: {
      keyframes: {
        slideDown:
          "{from {height:0px} to {height:var(--radix-accordion-content-height)}}",
        slideUp:
          "{from {height:var(--radix-accordion-content-height)} to {height:0px}}",
        overlayShow: "{from {opacity:0} to {opacity:1}}",
        contentShow:
          "{from {opacity:0;transform:translate(-50%,-50%) scale(0.96)} to {opacity:1; transform:translate(-50%,-50%) scale(1)}}"
      },
      durations: {
        slideDown: "300ms",
        slideUp: "300ms",
        overlayShow: "150ms",
        contentShow: "150ms"
      },
      timingFns: {
        slideDown: "cubic-bezier(0.87, 0, 0.13, 1)",
        slideUp: "cubic-bezier(0.87, 0, 0.13, 1)",
        overlayShow: "cubic-bezier(0.16, 1, 0.3, 1)",
        contentShow: "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    }
  }
})
