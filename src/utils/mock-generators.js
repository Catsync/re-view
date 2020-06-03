import DEFAULT_CONTEXT from '../context/state'

export const MOCK_DURATION = 60

export const buildBookmarks = (extras = [], overrides = {}) => {
  const { duration = 60 } = overrides
  const bookmarks = {
    '0': {
      time: 0,
      title: 'Start',
    },
    [duration]: {
      time: duration,
      title: 'End',
    },
  }

  extras.forEach((b) => {
    bookmarks[b.time] = b
  })

  return bookmarks
}

export const buildContext = (overrides = {}) => {
  return {
    ...DEFAULT_CONTEXT,
    bookmarks: buildBookmarks(),
    duration: MOCK_DURATION,
    loop: { start: 0, end: MOCK_DURATION },
    ...overrides,
  }
}
