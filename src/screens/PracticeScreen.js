import React from 'react'
import qs from 'query-string'
import { StateProvider } from '../context/state'
import ReView from '../components/ReView'
import GetVideoUrl from '../components/GetVideoUrl'

const PracticeScreen = ({ navigate, location }) => {
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
    <GetVideoUrl onSubmit={setUrl} />
  )
}

export default PracticeScreen
