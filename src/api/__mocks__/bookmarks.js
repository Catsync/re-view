const { DEFAULT_BOOKMARKS } = jest.requireActual('../bookmarks')
export { DEFAULT_BOOKMARKS }
export const getBookmarks = jest.fn().mockReturnValue({
  '0': { time: 0, title: 'Start' },
})

export const saveBookmarks = jest.fn()
