import { useEffect } from 'react'

const noop = () => {}
export default function (keyCode, handler = noop, { capture = true } = {}) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === keyCode) {
        if (capture) {
          e.preventDefault()
          e.stopPropagation()
        }
        handler(e)
      }
    }

    document.addEventListener('keydown', handleKey, false)
    return () => document.removeEventListener('keydown', handleKey, false)
  }, [capture, handler, keyCode])
}
