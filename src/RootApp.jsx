import { lazy, Suspense } from 'react'
import { PublicApp } from './public/PublicApp'

const App = lazy(() => import('./App.jsx'))

export function RootApp({ path, privatePage }) {
  return privatePage ? (
    <Suspense fallback={<p role="status">CareON을 불러오고 있어요.</p>}><App /></Suspense>
  ) : <PublicApp path={path} />
}
