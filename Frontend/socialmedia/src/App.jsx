import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './Components/Login'
import ProtectedRoute from './Components/ProtectedRoute'
import Layout from './Components/Layout'
import Home from './Components/Home'
import Register from './Components/Register'
import Profile from './Components/Profile'
import CustomProfile from './Components/customProfile'
import UserProvider from './Contexts/UserContext'


function App() {
  const router = createBrowserRouter([
    {
      path: "/", element: <Layout />, children: [
        {
          index: true, element: <ProtectedRoute><Home /></ProtectedRoute>
        },
        { path: "/signin", element: <Login /> },
        { path: "/signup", element: <Register /> },
        { path: "/profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
        { path: "/profile/:userId", element: <ProtectedRoute><CustomProfile /></ProtectedRoute> },
      ]
    }
  ])

  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  )
}

export default App
