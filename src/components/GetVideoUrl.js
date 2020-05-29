import React from 'react'
import { Box, Field, Button, Text } from 'theme-ui'
import ReactPlayer from 'react-player'

const GetVideoUrl = ({ onSubmit }) => {
  const [url, setUrl] = React.useState('')
  const [error, setError] = React.useState('')

  const handleChange = (e) => {
    setUrl(e.target.value)
    if (error) {
      setError('')
    }
  }

  const doSubmit = () => {
    const canPlay = ReactPlayer.canPlay(url)
    console.log('canPlay', canPlay)
    if (canPlay) {
      onSubmit(url)
    } else {
      setError(`That doesn't look like a video I can play.`)
    }
  }

  return (
    <Box sx={styles.container}>
      <Field label="Video URL:" value={url} onChange={handleChange} />
      {error ? <Text sx={styles.error}>{error}</Text> : null}
      <Button sx={styles.button} onClick={doSubmit}>
        Go
      </Button>
    </Box>
  )
}

const styles = {
  container: {
    width: '70%',
    margin: '0 auto',
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    '& > div': {
      width: '100%',
      mb: '1rem',
    },
  },
  error: {
    color: 'red',
  },
  button: {
    color: 'black',
  },
}
export default GetVideoUrl
