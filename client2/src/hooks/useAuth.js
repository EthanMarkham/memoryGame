import { useState } from "react";
import useCookies from 'react-cookie';

const useAuth = () => {
  const [userToken, setCookie, removeCookie] = useCookies(['userToken']);
  const [auth, setAuth] = useState({isAuth: false, user: 'Guest', token: (userToken) ? userToken : ''});

  const updateAuth = (isAuth, userInfo) => {
    if (isAuth) 
    {
      setCookie(userInfo.token);
      setAuth({isAuth: true, user: userInfo.username, token: userInfo.token})
    }
    else {
      removeCookie();
      setAuth({isAuth: false, user: 'Guest', token: ''})
    }
  }
  return [auth, updateAuth]
}

export default useAuth;

