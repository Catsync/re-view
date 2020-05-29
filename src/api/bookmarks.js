export const DEFAULT_BOOKMARKS = { 0: { time: 0, title: 'Start' } }

export function getBookmarks(key) {
  if (localStorage[key]) {
    try {
      return JSON.parse(localStorage[key])
    } catch {}
  }
  return DEFAULT_BOOKMARKS
}

export function saveBookmarks(key, data) {
  localStorage[key] = JSON.stringify(data)
}
