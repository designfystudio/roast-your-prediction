import { useEffect, useState } from 'react'

// Streams `text` character-by-character at `speed` ms per char.
// Returns [displayed, done] — done flips true when the full string is visible.
// Safe to call with null/undefined text; resets cleanly when text changes.
export function useTypingEffect(text, speed = 16) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!text) {
      setDisplayed('')
      setDone(false)
      return
    }
    setDisplayed('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return [displayed, done]
}
