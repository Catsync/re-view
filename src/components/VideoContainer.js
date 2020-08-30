import React from 'react'

const VideoContainer = ({ style, ...props }) => {
  return (
    <div
      style={{
        width: '100%',
        paddingTop: '56.25%',
        position: 'relative',
        '& > div': {
          position: 'absolute',
          top: 0,
        },
        ...style,
      }}
      {...props}
    />
  )
}

export default VideoContainer
