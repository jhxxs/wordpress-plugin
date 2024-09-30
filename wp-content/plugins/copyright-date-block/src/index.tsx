import { registerBlockType } from "@wordpress/blocks"
import edit from "./edit"
import save from "./save"
import metadata from "./block.json"

const icon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 1536 1536"
  >
    <path
      fill="currentColor"
      d="M1150 946v109q0 50-36.5 89t-94 60.5t-118 32.5t-117.5 11q-205 0-342.5-139T304 763q0-203 136-339t339-136q34 0 75.5 4.5t93 18t92.5 34t69 56.5t28 81v109q0 16-16 16h-118q-16 0-16-16v-70q0-43-65.5-67.5T784 429q-140 0-228.5 91.5T467 758q0 151 91.5 249.5T792 1106q68 0 138-24t70-66v-70q0-7 4.5-11.5t10.5-4.5h119q6 0 11 4.5t5 11.5M768 128q-130 0-248.5 51t-204 136.5t-136.5 204T128 768t51 248.5t136.5 204t204 136.5t248.5 51t248.5-51t204-136.5t136.5-204t51-248.5t-51-248.5t-136.5-204t-204-136.5T768 128m768 640q0 209-103 385.5T1153.5 1433T768 1536t-385.5-103T103 1153.5T0 768t103-385.5T382.5 103T768 0t385.5 103T1433 382.5T1536 768"
    />
  </svg>
)

registerBlockType(metadata.name as any, {
  icon,
  edit,
  save
})
