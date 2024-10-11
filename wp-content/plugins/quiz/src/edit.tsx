import { useBlockProps } from "@wordpress/block-editor"
import type { BlockEditProps } from "@wordpress/blocks"
import {
  Button,
  Flex,
  FlexBlock,
  FlexItem,
  Icon,
  TextControl
} from "@wordpress/components"
import type { ComponentType } from "react"
import { $t } from "./constant"
import "./editor.scss"
import "./unocss.css"

export interface EditProps {
  question?: string
  answers?: (string | undefined)[]
  correctAnswer?: number
}

export const Edit: ComponentType<BlockEditProps<EditProps>> = ({
  attributes,
  setAttributes
}) => {
  const { question = "", answers = [], correctAnswer } = attributes

  return (
    <div {...useBlockProps} className="paying-attention-edit-block">
      <TextControl
        label="Question:"
        placeholder={$t("Please input your question")}
        style={{
          fontSize: 20
        }}
        value={question || ""}
        onChange={(e) =>
          setAttributes({
            question: e
          })
        }
      />
      <p style={{ fontSize: 13, margin: "20px 0 8px 0" }}>{$t("Answers")}</p>
      {answers.map((answer, answerIndex, arr) => (
        <Flex>
          <FlexBlock>
            <TextControl
              autoFocus={answer === undefined}
              value={answer || ""}
              onChange={(e) => {
                const newAnswers = [...arr]
                newAnswers[answerIndex] = e
                setAttributes({
                  answers: newAnswers
                })
              }}
            />
          </FlexBlock>
          <FlexItem>
            <Button
              onClick={() =>
                setAttributes({
                  correctAnswer:
                    correctAnswer === answerIndex ? undefined : answerIndex
                })
              }
            >
              <Icon
                icon={
                  answerIndex === correctAnswer ? "star-filled" : "star-empty"
                }
                className="mark-as-correct"
              />
            </Button>
          </FlexItem>
          <FlexItem>
            <Button
              variant="link"
              className="attention-delete"
              onClick={() => {
                setAttributes({
                  answers: answers.filter((v, index) => answerIndex !== index),
                  correctAnswer: undefined
                })
                if (answerIndex === correctAnswer) {
                  setAttributes({ correctAnswer: undefined })
                }
              }}
            >
              {$t("Delete")}
            </Button>
          </FlexItem>
        </Flex>
      ))}
      <Button
        disabled={answers.length <= 1}
        variant="primary"
        onClick={() =>
          setAttributes({
            answers: [...(answers || []), undefined]
          })
        }
      >
        {$t("Add another answer")}
      </Button>
    </div>
  )
}
