import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../../context/authContext'

export default function PAdminPrivate({ children }) {

    const authContext = useContext(AuthContext)
    const navigate = useNavigate()

  return (
      <>
        {
            authContext.user.role == 'SuperAdmin' || authContext.user.role == 'Admin' ? <>{children}</> : navigate('/login')
        }
      </>
  )
}
