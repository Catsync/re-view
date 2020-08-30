import React from 'react'

const VideoOverlay = ({ children }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        '& > canvas': {
          width: '100%',
          height: '100%',
        },
      }}
    >
      <canvas></canvas>
      {children}
    </div>
  )
}

export default VideoOverlay
