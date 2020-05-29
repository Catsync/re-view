/** @jsx jsx */
// import React from 'react'
import { jsx, Box, Progress as ThemeProgress } from 'theme-ui'

const Progress = ({
  playedValue,
  loadedValue,
  height = '0.5rem',
  ...props
}) => {
  return (
    <Box sx={{ bg: 'orange', position: 'relative' }}>
      <ThemeProgress
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          height,
          borderRadius: 0,
          color: 'darkgrey',
          bg: 'black',
          zIndex: 1,
        }}
        {...props}
        value={loadedValue}
      />
      <ThemeProgress
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          height,
          borderRadius: 0,
          color: '#99ccff',
          bg: 'transparent',
          zIndex: 2,
        }}
        {...props}
        value={playedValue}
      />
    </Box>
  )
}

export default Progress
