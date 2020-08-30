import React from 'react'

const OverlayText = ({ children, style, ...props }) => (
  <div
    style={{
      position: 'absolute',
      color: 'white',
      fontWeight: 'bold',
      fontSize: 36,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
)

export default OverlayText
