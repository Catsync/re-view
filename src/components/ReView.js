/** @jsx jsx */
import _ from 'lodash'
import { jsx } from 'theme-ui'
import React from 'react'
import { useVirtual } from 'react-virtual'
import ReactPlayer from 'react-player'
import { useAppState, useAppActions } from '../context/state'
import useKey from '../hooks/useKey'
import Progress from './Progress'
import VideoBookmark from './VideoBookmark'
import { getBookmarks } from '../api/bookmarks'

// TODO: full screen?
// TODO: option to speak the bookmark titles?

const config = {
  youtube: {
    playerVars: {
      rel: 1,
    },
  },
}

const ReView = ({ videoUrl }) => {
  const scrollParentRef = React.useRef()
  const { state, service, playerRef } = useAppState()
  const { send } = useAppActions()
  const { playedSeconds, played, loaded, loop, playbackRate } = state.context
  const isPlaying = state.matches('playing')
  const isLoading = state.matches('loading')
  const editing = state.matches('editing')
  const bookmarks = _.sortBy(Object.values(state.context.bookmarks), ['time'])
  const lastBookmark = _.findLast(bookmarks, (b) => playedSeconds >= b.time)
  const lastBookmarkIndex = bookmarks.indexOf(lastBookmark)
  console.log('ReView')
  React.useEffect(() => {
    if (service.initialized === true) {
      send({
        type: 'INITIALIZE_BOOKMARKS',
        bookmarks: getBookmarks(videoUrl),
        videoUrl,
      })
    }
  }, [send, service.initialized, videoUrl])

  const rowVirtualizer = useVirtual({
    size: bookmarks.length,
    parentRef: scrollParentRef,
    estimateSize: React.useCallback(() => 57, []),
    overscan: 2,
  })

  const togglePlaying = React.useCallback(
    (e) => {
      send({ type: 'TOGGLE_PLAYING' })
    },
    [send]
  )

  const createBookmark = React.useCallback(
    (e) => {
      send({ type: 'CREATE_BOOKMARK' })
    },
    [send]
  )

  useKey('Space', togglePlaying, { capture: !editing })
  useKey('Enter', createBookmark, { capture: !editing })

  React.useEffect(() => {
    if (!playerRef.current) {
      return
    }
    if (playedSeconds < loop.start || playedSeconds > loop.end) {
      playerRef.current.seekTo(loop.start, 'seconds')
    }
  }, [loop, playedSeconds, playerRef])

  React.useEffect(() => {
    if (isPlaying) {
      rowVirtualizer.scrollToIndex(lastBookmarkIndex)
    }
  }, [isPlaying, lastBookmarkIndex, rowVirtualizer])

  const onProgress = (data) => {
    send({ type: 'UPDATE_PROGRESS', payload: data })
  }

  const onDuration = (duration) => {
    send({ type: 'SET_DURATION', duration })
  }

  const handleSetStart = (e, time) => {
    e.stopPropagation()
    send({ type: 'SET_LOOP_START', time })
  }

  const handleSetEnd = (e, time) => {
    e.stopPropagation()
    send({ type: 'SET_LOOP_END', time })
  }

  const handleUpdateBookmark = (data) => {
    send({ type: 'UPDATE_BOOKMARK', bookmark: data })
  }

  const handleSpeedChange = (e) => {
    send({ type: 'SET_PLAYBACK_RATE', playbackRate: e.target.value })
  }

  const doDeleteBookmark = (bookmark) => {
    send({ type: 'DELETE_BOOKMARK', bookmark })
  }

  return (
    <div style={styles.container}>
      <div style={styles.playerColumn}>
        <div data-testid="player-wrapper" style={styles.playerWrapper}>
          <ReactPlayer
            ref={playerRef}
            style={styles.player}
            width="100%"
            height="100%"
            url={videoUrl}
            config={config}
            progressInterval={100}
            playbackRate={playbackRate}
            playing={isLoading || isPlaying}
            onProgress={onProgress}
            onDuration={onDuration}
          />
        </div>
        <div sx={styles.controlsContainer}>
          <Progress max={1} playedValue={played} loadedValue={loaded} />
          <div style={styles.controls}>
            <button onClick={togglePlaying}>
              {isLoading ? '...' : isPlaying ? 'Pause' : 'Play'}
            </button>
            <span>Time: {playedSeconds.toFixed(1)}s</span>
            <div>
              <label htmlFor="playbackSpeed">Speed: </label>
              <select
                id="playbackSpeed"
                onChange={handleSpeedChange}
                value={playbackRate}
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <div style={{ ...styles.textContainer, marginTop: '1rem' }}>
            Space Bar to toggle play/pause.
            <br />
            Enter to create a bookmark at the current timestamp of the video.
            <br />
            Click a bookmark to jump to that timestamp. Use the Start/End
            buttons on the bookmarks to control how the video loops.
          </div>
          <div style={styles.textContainer}>
            Think this tool is useful and would like to use it with other
            videos? Let me know at cat@shenans.co
          </div>
        </div>
      </div>
      <div
        style={styles.bookmarks}
        ref={scrollParentRef}
        data-testid="bookmarks-scroll"
      >
        <div
          style={{
            height: `${rowVirtualizer.totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.virtualItems.map((virtualRow) => {
            const bookmark = bookmarks[virtualRow.index]
            const isCurrent = lastBookmark.time === bookmark.time
            const isLoopStart = loop.start === bookmark.time
            const isLoopEnd = loop.end === bookmark.time
            return (
              <VideoBookmark
                key={bookmark.time}
                rowProps={virtualRow}
                bookmark={bookmark}
                isCurrent={isCurrent}
                isLoopStart={isLoopStart}
                isLoopEnd={isLoopEnd}
                onSetStart={handleSetStart}
                onSetEnd={handleSetEnd}
                onUpdateBookmark={handleUpdateBookmark}
                onDeleteBookmark={doDeleteBookmark}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    height: '100vh',
    padding: '2rem 1rem',
    display: 'flex',
    flexWrap: 'wrap',
  },
  playerColumn: {
    flex: 3,
    marginRight: '1rem',
    maxWidth: '100vw',
  },
  playerWrapper: {
    position: 'relative',
    paddingTop: '56.25%', // Player ratio 100 / (1280 / 720)
  },
  player: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'white',
  },
  controlsContainer: {
    borderBottomLeftRadius: '6px',
    borderBottomRightRadius: '6px',
  },
  controls: {
    // width: '640px',
    width: '100%',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '1rem',
    paddingTop: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: '6px',
    borderBottomRightRadius: '6px',
  },
  bookmarks: {
    flex: 2,
    maxHeight: '95vh',
    overflow: 'auto',
  },
  textContainer: {
    marginBottom: '0.5rem',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '6px',
  },
}
export default ReView
