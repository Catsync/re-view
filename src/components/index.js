import React from 'react'
import ReView from './ReView'
import { StateProvider } from '../context/state'

export default (props) => (
  <StateProvider>
    <ReView {...props} />
  </StateProvider>
)
