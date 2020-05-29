import React from 'react'
import { Machine, assign } from 'xstate'
import { useMachine } from '@xstate/react'
import produce from 'immer'
import { DEFAULT_BOOKMARKS, saveBookmarks } from '../api/bookmarks'

const AppStateContext = React.createContext()
const AppActionsContext = React.createContext()

const noop = () => {}

export const DEFAULT_CONTEXT = {
  videoUrl: undefined,
  playedSeconds: 0,
  playbackRate: 1,
  played: 0,
  loaded: 0,
  loop: { start: 0, end: 0 },
  bookmarks: DEFAULT_BOOKMARKS,
}

const appState = Machine(
  {
    id: 'videoAppState',
    initial: 'pending',
    context: DEFAULT_CONTEXT,
    states: {
      pending: {
        on: {
          INITIALIZE_BOOKMARKS: {
            target: 'idle',
            actions: 'initBookmarks',
          },
        },
      },
      idle: {
        on: {
          TOGGLE_PLAYING: {
            target: 'loading',
          },
          SET_DURATION: {
            target: 'idle',
            actions: 'setDuration',
          },
          SET_LOOP_START: {
            target: 'idle',
            actions: 'setLoopStart',
          },
          SET_LOOP_END: {
            target: 'idle',
            actions: 'setLoopEnd',
          },
          SET_PLAYBACK_RATE: {
            target: 'idle',
            actions: 'setPlaybackRate',
          },
          START_EDIT: {
            target: 'editing',
          },
          UPDATE_PROGRESS: {
            target: 'loading',
            actions: ['updateProgress'],
            cond: 'doneLoading',
          },
          SEEK: {
            target: 'loading',
            actions: 'seekTo',
          },
        },
      },
      loading: {
        on: {
          UPDATE_PROGRESS: {
            target: 'playing',
            actions: ['updateProgress'],
            cond: 'doneLoading',
          },
        },
      },
      playing: {
        on: {
          TOGGLE_PLAYING: {
            target: 'paused',
          },
          CREATE_BOOKMARK: {
            target: 'playing',
            actions: ['createBookmark', 'persistBookmarks'],
          },
          UPDATE_PROGRESS: {
            target: 'playing',
            actions: 'updateProgress',
          },
          SET_LOOP_START: {
            target: 'playing',
            actions: 'setLoopStart',
          },
          SET_LOOP_END: {
            target: 'playing',
            actions: 'setLoopEnd',
          },
          SET_PLAYBACK_RATE: {
            target: 'playing',
            actions: 'setPlaybackRate',
          },
          SEEK: {
            target: 'playing',
            actions: 'seekTo',
          },
        },
      },
      paused: {
        on: {
          TOGGLE_PLAYING: {
            target: 'playing',
          },
          CREATE_BOOKMARK: {
            target: 'paused',
            actions: 'createBookmark',
          },
          SET_LOOP_START: {
            target: 'paused',
            actions: 'setLoopStart',
          },
          SET_LOOP_END: {
            target: 'paused',
            actions: 'setLoopEnd',
          },
          SET_PLAYBACK_RATE: {
            target: 'paused',
            actions: 'setPlaybackRate',
          },
          START_EDIT: {
            target: 'editing',
          },
          SEEK: {
            target: 'paused',
            actions: 'seekTo',
          },
        },
      },
      editing: {
        exit: 'persistBookmarks',
        on: {
          STOP_EDIT: {
            target: 'paused',
          },
          UPDATE_BOOKMARK: {
            target: 'editing',
            internal: 'true',
            actions: 'updateBookmark',
          },
          DELETE_BOOKMARK: {
            target: 'editing',
            actions: 'deleteBookmark',
          },
        },
      },
    },
  },
  {
    actions: {
      initBookmarks: assign({
        bookmarks: (context, event) => event.bookmarks,
        videoUrl: (c, e) => e.videoUrl,
      }),
      updateBookmark: assign({
        bookmarks: (c, e) =>
          produce(c.bookmarks, (draft) => {
            draft[e.bookmark.time] = e.bookmark
          }),
      }),
      deleteBookmark: assign({
        bookmarks: (c, e) =>
          produce(c.bookmarks, (draft) => {
            delete draft[e.bookmark.time]
          }),
      }),
      persistBookmarks: (c, e) => {
        saveBookmarks(c.videoUrl, c.bookmarks)
      },
      setDuration: assign((c, e) =>
        produce(c, (draft) => {
          const { duration } = e
          draft.duration = duration
          if (!draft.bookmarks[duration]) {
            draft.bookmarks[duration] = { time: duration, title: 'End' }
          }
          if (draft.loop.end === 0) {
            draft.loop.end = duration
          }
        })
      ),
      updateProgress: assign({
        playedSeconds: (c, e) => e.payload.playedSeconds,
        played: (c, e) => e.payload.played,
        loadedSeconds: (c, e) => e.payload.loadedSeconds,
        loaded: (c, e) => e.payload.loaded,
      }),
      createBookmark: assign({
        bookmarks: (context, event) =>
          produce(context.bookmarks, (draft) => {
            const { playedSeconds } = context
            if (!draft[playedSeconds]) {
              draft[playedSeconds] = {
                time: playedSeconds,
                title: `Bookmark at ${playedSeconds.toFixed(1)}`,
              }
            }
          }),
      }),
      setLoopStart: assign((c, e) =>
        produce(c, (draft) => {
          draft.loop.start = e.time
          if (draft.loop.end < e.time) {
            draft.loop.end = e.time
          }
        })
      ),
      setLoopEnd: assign((c, e) =>
        produce(c, (draft) => {
          draft.loop.end = e.time
          if (draft.loop.end < draft.loop.start) {
            draft.loop.start = e.time
          }
        })
      ),
      setPlaybackRate: assign({
        playbackRate: (c, e) => parseFloat(e.playbackRate),
      }),
      seekTo: noop, // override in app
    },
    guards: {
      doneLoading: (ctx, ev, meta) => {
        const { loadedSeconds, playedSeconds } = ev.payload
        if (loadedSeconds > playedSeconds) {
          return true
        }
        return false
      },
    },
  }
)

export const StateProvider = ({ children, initialContext }) => {
  const playerRef = React.useRef()
  const [state, send, service] = useMachine(appState, {
    context: initialContext,
    actions: {
      seekTo: (ctx, ev) => {
        if (playerRef.current) {
          playerRef.current.seekTo(ev.time, 'seconds')
        }
      },
    },
  })
  const value = React.useMemo(() => ({ state, service, playerRef }), [
    service,
    state,
  ])

  return (
    <AppStateContext.Provider value={value}>
      <AppActionsContext.Provider value={{ send }}>
        {children}
      </AppActionsContext.Provider>
    </AppStateContext.Provider>
  )
}

export const useAppState = () => {
  const context = React.useContext(AppStateContext)
  if (context === undefined) {
    throw new Error('useAppState can only be used inside of a StateProvider')
  }
  return context
}

export const useAppActions = () => {
  const context = React.useContext(AppActionsContext)
  if (context === undefined) {
    throw new Error('useAppActions can only be used inside of a StateProvider')
  }
  return context
}
