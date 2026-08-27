import { useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"

export function useTiptapEditor(provided?: Editor | null) {
  const [editor, setEditor] = useState<Editor | null | undefined>(provided)

  useEffect(() => {
    if (provided !== undefined) setEditor(provided)
  }, [provided])

  return { editor }
}
