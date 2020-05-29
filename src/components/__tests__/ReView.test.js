import React from 'react'
import {
  render,
  renderWithProviders,
  within,
  fireEvent,
  wait,
} from '../../utils/testing'
import ReView from '../ReView'
import { getBookmarks, saveBookmarks } from '../../api/bookmarks'
import ReactPlayer from 'react-player'

jest.mock('../../api/bookmarks')
jest.mock('react-player')
jest.mock('react-player', () => {
  const React = require('React')
  return React.forwardRef((props, ref) => {
    const {
      progressInterval,
      playing,
      playbackRate,
      onDuration,
      onProgress,
      ...rest
    } = props
    // This triggers a warning. Not sure why.
    // React.useImperativeHandle(ref, () => ({
    //   testProgress: data => onProgress(data)
    // }))

    // This might be sketchy :p
    const fireOnProgress = (e) => {
      const value = parseFloat(e.target.value)
      onProgress({ playedSeconds: value, loadedSeconds: value * 1.1 })
    }

    return (
      <div>
        <div {...rest}>Mock Player</div>
        <div>player.playing: {playing?.toString()}</div>
        <div>player.playbackRate: {playbackRate}</div>
        <div>
          <button onClick={fireOnProgress}>updatePlayedSeconds</button>
        </div>
      </div>
    )
  })
})

beforeEach(() => {
  jest.clearAllMocks()
})

test('mock player', () => {
  const { getByText } = render(<ReactPlayer />)
  getByText(/mock player/i)
})

test('it renders a video player', () => {
  const view = renderWithProviders(<ReView />)
  view.getByTestId('player-wrapper')
  view.getByText(/mock player/i)
  view.getByText('Play')
  view.getByText(/^Time:/)
  view.getByText(/^Speed:/)
})

test('Can click to play and pause', async () => {
  const view = renderWithProviders(<ReView />)
  const scroller = view.getByTestId('bookmarks-scroll')
  const player = view.getByTestId('player-wrapper')
  const mockProgress = view.getByText('updatePlayedSeconds')

  const playButton = view.getByText('Play')
  within(player).getByText('player.playing: false')
  expect(scroller.scrollTop).toBe(0)
  fireEvent.click(playButton)

  // Firsts goes into loading state
  within(player).getByText('player.playing: true')
  view.getByText('...')
  expect(scroller.scrollTop).toBe(0)

  // Can't pause while loading
  fireEvent.click(playButton)
  within(player).getByText('player.playing: true')
  view.getByText('...')
  expect(scroller.scrollTop).toBe(0)

  // Then goes into playing after progress happens
  fireEvent.click(mockProgress, { target: { value: 0.1 } })
  within(player).getByText('player.playing: true')
  view.getByText('Pause')
  expect(scroller.scrollTop).toBe(57)

  fireEvent.click(playButton)
  view.getByText('Play')
  within(player).getByText('player.playing: false')
  // FIXME: this prevents an act() warning, that seemed to be caused by the scrolling Effect, but I'm not sure how else to avoid the warning.
  await wait()
})

test('Can play/pause with space bar', async () => {
  const view = renderWithProviders(<ReView />)
  const player = view.getByTestId('player-wrapper')
  const mockProgress = view.getByText('updatePlayedSeconds')

  within(player).getByText('player.playing: false')
  view.getByText('Play')

  fireEvent.keyDown(document, { code: 'Space' })

  within(player).getByText('player.playing: true')
  view.getByText('...')

  // Can't pause while loading
  fireEvent.keyDown(document, { code: 'Space' })
  within(player).getByText('player.playing: true')
  view.getByText('...')

  fireEvent.click(mockProgress, { target: { value: 0.1 } })
  within(player).getByText('player.playing: true')
  view.getByText('Pause')

  fireEvent.keyDown(document, { code: 'Space' })

  within(player).getByText('player.playing: false')
  view.getByText('Play')
  // Prevent act error due to scrolling effect?
  await wait()
})

test('Displays bookmarks', () => {
  const title = 'Another bookmark'
  const bookmarks = {
    '0': {
      time: 0,
      title: 'Start',
    },
    '1.4': {
      time: 1.4,
      title: title,
    },
  }
  getBookmarks.mockReturnValue(bookmarks)
  const view = renderWithProviders(<ReView />)

  view.getByText(/^0.0s: Start/)
  view.getByText(/another bookmark/i)
})

test('Create a bookmark by pressing Enter', () => {
  const bookmarks = {
    '0': {
      time: 0,
      title: 'Start',
    },
    '1.4359239732971192': {
      time: 1.4359239732971192,
      title: 'Another bookmark',
    },
  }
  const videoUrl = 'http://shenans.co'
  getBookmarks.mockReturnValue(bookmarks)

  const view = renderWithProviders(<ReView videoUrl={videoUrl} />)

  view.getByText(/^0.0s: Start/)
  view.getByText(/another bookmark/i)
  view.getByText(/^Time: 0.0s/)
  expect(saveBookmarks).not.toHaveBeenCalled()

  const progress = view.getByText('updatePlayedSeconds')
  const playButton = view.getByText('Play')
  fireEvent.click(playButton)
  fireEvent.click(progress, { target: { value: 1.1 } })

  view.getByText(/^Time: 1.1s/)
  fireEvent.keyDown(document, { code: 'Enter' })
  view.getByText('1.1s: Bookmark at 1.1')
  expect(saveBookmarks).toHaveBeenCalledTimes(1)
  expect(saveBookmarks.mock.calls[0][0]).toEqual(videoUrl)
  expect(saveBookmarks.mock.calls[0][1]).toMatchInlineSnapshot(`
    Object {
      "0": Object {
        "time": 0,
        "title": "Start",
      },
      "1.1": Object {
        "time": 1.1,
        "title": "Bookmark at 1.1",
      },
      "1.4359239732971192": Object {
        "time": 1.4359239732971192,
        "title": "Another bookmark",
      },
    }
  `)
})

test('can set the start and end of the loop', () => {
  const bookmarks = {
    '0': {
      time: 0,
      title: 'Bookmark 1',
    },
    '2': {
      time: 2,
      title: 'Bookmark 2',
    },
    '3': {
      time: 3,
      title: 'Bookmark 3',
    },
  }
  getBookmarks.mockReturnValue(bookmarks)
  const context = {
    bookmarks,
    loop: { start: 0, end: 3 },
  }
  const view = renderWithProviders(<ReView />, { context })
  const startButtons = view.getAllByText('Start')
  const endButtons = view.getAllByText('End')
  within(view.getByTestId(/bookmark.*current/)).getByText(/Bookmark 1/)
  within(view.getByTestId(/bookmark.*start/)).getByText(/Bookmark 1/)
  within(view.getByTestId(/bookmark.*end/)).getByText(/Bookmark 3/)

  // Change start to bookmark 2
  fireEvent.click(startButtons[1])
  within(view.getByTestId(/bookmark.*current/)).getByText(/Bookmark 1/)
  within(view.getByTestId(/bookmark.*start/)).getByText(/Bookmark 2/)
  within(view.getByTestId(/bookmark.*end/)).getByText(/Bookmark 3/)

  // Change end to bookmark 1, also causing start to change
  fireEvent.click(endButtons[0])
  within(view.getByTestId(/bookmark.*current/)).getByText(/Bookmark 1/)
  within(view.getByTestId(/bookmark.*start/)).getByText(/Bookmark 1/)
  within(view.getByTestId(/bookmark.*end/)).getByText(/Bookmark 1/)

  // Change start to bookmark 3, also causing end to change
  fireEvent.click(startButtons[2])
  within(view.getByTestId(/bookmark.*current/)).getByText(/Bookmark 1/)
  within(view.getByTestId(/bookmark.*start/)).getByText(/Bookmark 3/)
  within(view.getByTestId(/bookmark.*end/)).getByText(/Bookmark 3/)
})

test('can set the playback rate', () => {
  const view = renderWithProviders(<ReView />)
  const speedSelect = view.getByLabelText('Speed:')
  const player = view.getByTestId('player-wrapper')

  within(player).getByText('player.playbackRate: 1')
  expect(speedSelect.value).toEqual('1')

  fireEvent.change(speedSelect, { target: { value: 0.5 } })
  within(player).getByText('player.playbackRate: 0.5')
  expect(speedSelect.value).toEqual('0.5')
})

test('can delete a bookmark', () => {
  const data = {
    '0': {
      time: 0,
      title: 'Bookmark 1',
    },
    '2': {
      time: 2,
      title: 'Bookmark 2',
    },
    '3': {
      time: 3,
      title: 'Bookmark 3',
    },
  }
  getBookmarks.mockReturnValue(data)
  const context = {
    bookmarks: data,
    loop: { start: 0, end: 3 },
  }
  const videoUrl = 'http://shenans.co'
  const view = renderWithProviders(<ReView videoUrl={videoUrl} />, {
    context,
  })

  expect(saveBookmarks).not.toHaveBeenCalled()
  const bookmarksList = view.getByTestId(/bookmarks/)
  let bookmarks = within(bookmarksList).getAllByTestId(/bookmark/)
  expect(bookmarks.length).toBe(3)
  const b1 = bookmarks[1]
  expect(b1).toHaveTextContent(/Bookmark 2/)
  const editBtn = within(b1).getByText('Edit')
  expect(within(b1).queryByText('X')).not.toBeInTheDocument()

  fireEvent.click(editBtn)
  const deleteBtn = within(b1).getByText('X')
  fireEvent.click(deleteBtn)

  bookmarks = within(bookmarksList).getAllByTestId(/bookmark/)
  expect(bookmarks.length).toBe(2)
  expect(bookmarks[1]).toHaveTextContent(/Bookmark 3/)
  expect(saveBookmarks).toHaveBeenCalledTimes(1)
  expect(saveBookmarks.mock.calls[0][0]).toEqual(videoUrl)
  expect(saveBookmarks.mock.calls[0][1]).toMatchInlineSnapshot(`
    Object {
      "0": Object {
        "time": 0,
        "title": "Bookmark 1",
      },
      "3": Object {
        "time": 3,
        "title": "Bookmark 3",
      },
    }
  `)
})

test.todo('click bookmark to seek video')
// TODO: need to figure out how to handle mock player ref.
// test('click bookmark to seek video', () => {
//   const bookmarks = {
//     '0': {
//       time: 0,
//       title: 'Start',
//     },
//     '1.4359239732971192': {
//       time: 1.4359239732971192,
//       title: 'Another bookmark',
//     },
//   }
//   getBookmarks.mockReturnValue(bookmarks)

//   const view = render(<VideoPracticeApp />)

//   view.getByText(/^Time: 0.0s/)
//   const seekButton = view.getByText(/another bookmark/i)
//   fireEvent.click(seekButton)
//   view.getByText(/^Time: 1.4s/)
// })
