import React from 'react'
import { Router } from '@reach/router'
import HomeScreen from './screens/HomeScreen'
import PracticeScreen from './screens/PracticeScreen'

const App = () => {
  return (
    <Router style={styles.column}>
      <HomeScreen path="/" />
      <PracticeScreen path="/video" />
    </Router>
  )
}

const styles = {
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
}
export default App
