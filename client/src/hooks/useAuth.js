import { useState } from "react";

const useAuth = () => {
  var token = localStorage.getItem('jwt')
  const [auth, setAuth] = useState({isAuth: false, user: null, token: (token) ? token : ''});

  const updateAuth = (isAuth, userInfo) => {
    if (isAuth) 
    {
      localStorage.setItem('jwt', userInfo.token)
      setAuth({isAuth: true, user: userInfo.username, token: userInfo.token})
    }
    else {
      localStorage.setItem('jwt', '')
      setAuth({isAuth: false, user: 'Guest', token: ''})
    }
  }
  return [auth, updateAuth]
}

export default useAuth;