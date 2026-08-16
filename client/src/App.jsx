import React from 'react'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'

const App = () => {
  return (
    <>
    <Toaster position='bottom-left' />
    <AppRoutes />
    </>
  )
}

export default App