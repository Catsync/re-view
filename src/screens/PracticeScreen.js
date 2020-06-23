import React from 'react'
import qs from 'query-string'
import { StateProvider } from '../context/state'
import ReView from '../components/ReView'
import GetVideoUrl from '../components/GetVideoUrl'

const PracticeScreen = ({ navigate, location }) => {
  const params = qs.parse(location.search)
  const [url, setUrl] = React.useState('')
  const [shareLink, setShareLink] = React.useState(null)

  React.useEffect(() => {
    if (url && url !== params.url) {
      const videoParams = qs.stringify({ url })
      navigate(`/video?${videoParams}`)
    }
  }, [navigate, params.url, url])

  const generateShareLink = (data) => {
    const shareParams = qs.stringify({
      url: params.url,
      data,
    })
    const shareUrl = `${location.origin}/${location.pathname}?${shareParams}`
    setShareLink(shareUrl)
  }

  const clearShare = React.useCallback(() => {
    setShareLink(null)
  }, [])

  return params.url ? (
    <StateProvider>
      <ReView
        videoUrl={params.url}
        data={params.data}
        onShare={generateShareLink}
        clearShare={clearShare}
        shareLink={shareLink}
      />
    </StateProvider>
  ) : (
    <GetVideoUrl onSubmit={setUrl} />
  )
}

export default PracticeScreen
