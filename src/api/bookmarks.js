export const DEFAULT_BOOKMARKS = { 0: { time: 0, title: 'Start' } }

export function getBookmarks(key, data) {
  let localBookmarks = {}
  let urlBookmarks = {}

  if (localStorage[key]) {
    try {
      localBookmarks = JSON.parse(localStorage[key])
    } catch {}
  }
  if (data) {
    try {
      urlBookmarks = JSON.parse(atob(data))
    } catch (error) {}
  }

  return {
    ...DEFAULT_BOOKMARKS,
    ...urlBookmarks,
    ...localBookmarks,
  }
}

export function saveBookmarks(key, data) {
  localStorage[key] = JSON.stringify(data)
}
