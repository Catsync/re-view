/** @jsx jsx  */
// import React from 'react'
import { jsx } from 'theme-ui'
import { Machine, assign } from 'xstate'
import { useMachine } from '@xstate/react'
import { useAppActions } from '../context/state'

const editingMachine = Machine({
  id: 'editing',
  initial: 'viewing',
  context: {
    bookmark: null,
  },
  states: {
    viewing: {
      on: {
        START_EDIT: {
          target: 'editing',
          actions: 'broadcastEvent',
        },
      },
    },
    editing: {
      on: {
        STOP_EDIT: {
          target: 'viewing',
          actions: ['submitEdits', 'broadcastEvent'],
        },
        UPDATE_TITLE: {
          target: 'editing',
          actions: ['updateTitle'],
        },
      },
    },
  },
})

const VideoBookmark = ({
  rowProps,
  bookmark,
  isCurrent,
  isLoopStart,
  isLoopEnd,
  onSetStart,
  onSetEnd,
  onUpdateBookmark,
  onDeleteBookmark,
}) => {
  const { send: appSend } = useAppActions()
  const [state, send] = useMachine(editingMachine, {
    context: {
      bookmark,
    },
    actions: {
      broadcastEvent: (ctx, event) => {
        appSend({ type: event.type })
      },
      updateTitle: assign({
        bookmark: (context, event) => {
          return {
            ...context.bookmark,
            title: event.title,
          }
        },
      }),
      submitEdits: (context, event) => {
        onUpdateBookmark(context.bookmark)
      },
    },
  })
  // console.log('bookmark', bookmark.title, state.value, state.context)
  const { time, title } = state.context.bookmark
  const isEditing = state.matches('editing')
  const { size, start } = rowProps
  const virtualStyle = {
    height: `${size - 4}px`,
    transform: `translateY(${start}px)`,
  }
  const style = isCurrent
    ? { ...styles.bookmark, ...styles.hilight, ...virtualStyle }
    : { ...styles.bookmark, ...virtualStyle }

  const toggleEditing = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const eventType = isEditing ? 'STOP_EDIT' : 'START_EDIT'
    send(eventType)
  }

  const handleUpdateTitle = (e) => {
    e.stopPropagation()
    send({ type: 'UPDATE_TITLE', title: e.target.value })
  }

  const handleDeleteBokmark = (e) => {
    e.stopPropagation()
    onDeleteBookmark(bookmark)
  }

  const doSeek = (time) => {
    appSend({ type: 'SEEK', time })
  }

  const testId = [
    'bookmark',
    isCurrent && 'current',
    isLoopStart && 'start',
    isLoopEnd && 'end',
  ]
    .filter(Boolean)
    .join('-')

  return (
    <div sx={style} onClick={() => doSeek(time)} data-testid={testId}>
      <div>
        {time.toFixed(1)}s:{' '}
        {isEditing ? (
          <input value={title} onChange={handleUpdateTitle} />
        ) : (
          title
        )}
      </div>
      <div>
        {isEditing ? (
          <button sx={styles.dangerButton} onClick={handleDeleteBokmark}>
            X
          </button>
        ) : null}
        <button sx={styles.button} onClick={toggleEditing}>
          {isEditing ? `Save` : `Edit`}
        </button>
        <button
          sx={
            isLoopStart
              ? { ...styles.startMark, ...styles.startColor }
              : styles.startMark
          }
          onClick={(e) => onSetStart(e, time)}
        >
          Start
        </button>
        <button
          sx={
            isLoopEnd
              ? { ...styles.stopMark, ...styles.stopColor }
              : styles.stopMark
          }
          onClick={(e) => onSetEnd(e, bookmark.time)}
        >
          End
        </button>
      </div>
    </div>
  )
}

const styles = {
  bookmark: {
    position: 'absolute',
    width: '100%',
    height: '52px',
    marginBottom: '0.5rem',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    '&:hover button': {
      visibility: 'visible',
    },
  },
  button: {
    visibility: 'hidden',
    padding: '0.5rem',
    marginRight: '0.5rem',
  },
  dangerButton: {
    marginRight: '0.75rem',
    backgroundColor: 'darkred',
    color: 'white',
  },
  startMark: {
    visibility: 'hidden',
    padding: '0.5rem',
    margin: 0,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
  },
  startColor: {
    visibility: 'visible',
    backgroundColor: '#a5e2a5',
  },
  stopMark: {
    visibility: 'hidden',
    padding: '0.5rem',
    margin: 0,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
  },
  stopColor: {
    visibility: 'visible',
    backgroundColor: '#f57979',
  },
  hilight: {
    border: 'dashed 2px black',
  },
}

export default VideoBookmark
