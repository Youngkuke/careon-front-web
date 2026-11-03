import { renderToString } from 'react-dom/server'
import { PublicApp } from './public/PublicApp'

export function renderPublicPage(path) {
  return renderToString(<PublicApp path={path} />)
}
