/** @jsx jsx */
import React from 'react'
import { jsx, Box, Text, Heading } from 'theme-ui'
import qs from 'query-string'
import { StateProvider } from '../context/state'
import ReView from '../components/ReView'
import GetVideoUrl from '../components/GetVideoUrl'

const HomeScreen = ({ navigate, location }) => {
  const params = qs.parse(location.search)
  const [url, setUrl] = React.useState('')

  React.useEffect(() => {
    if (url && url !== params.url) {
      const videoParams = qs.stringify({ url })
      navigate(`/video?${videoParams}`)
    }
  }, [navigate, params.url, url])

  return params.url ? (
    <StateProvider>
      <ReView videoUrl={params.url} />
    </StateProvider>
  ) : (
    <Box sx={styles.page}>
      <Box sx={styles.container}>
        <Heading sx={styles.header}>Re-View Video Practice</Heading>
        <Text sx={styles.text}>
          This is an app to help you practice along with any video.
        </Text>
        <Text sx={styles.text}>
          Use the <code>Space Bar</code> to Play and Pause the video.
        </Text>
        <Text sx={styles.text}>
          Use the <code>Enter</code> key to create a bookmark at the current
          timestamp in the video.
        </Text>
        <Text sx={styles.text}>
          After creating bookmarks, set the Start and End point to make the
          video loop.
        </Text>

        <Text sx={styles.text}>Your bookmarks are saved in your browser.</Text>
        <Text sx={styles.text}>
          If you find this tool useful, or have suggestions on how to make it
          better, let me know at cat@shenans.co.
        </Text>

        <Text sx={styles.text}>
          Copy the url to a video into the input below.
        </Text>
        <GetVideoUrl onSubmit={setUrl} />
        <Text sx={styles.text}>
          <a
            href="https://taiji-drills.shenans.co/video?url=https%3A%2F%2Fyoutu.be%2FESmo4-vKPsg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Here's an example
          </a>{' '}
          using this app to learn Tai Chi.
        </Text>
      </Box>
    </Box>
  )
}

const styles = {
  page: {
    width: '100%',
    maxWidth: '72rem',
    height: '100%',
    margin: '0 auto',
  },
  container: {
    marginTop: '2rem',
    paddingY: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '6px',
    bg: 'white',
  },
  header: {
    mb: '1rem',
  },
  text: {
    width: '70%',
    mb: '1.5rem',
  },
}

export default HomeScreen
