import Cookies from 'universal-cookie';
const SERVER_URL = "http://localhost:5000/";

export const getGridLayout = (itemCount, windowSize) => {
  if (windowSize.height === 0 || windowSize.width === 0) return
  let windowDivedend = (windowSize.width / windowSize.height)
  let factorDividends = getFactors(itemCount).map(f => ({
    factor: f,
    dividend: (f[0] / f[1])
  }))
  let output = { dividend: itemCount, factor: [itemCount, 1] } //need to better use reducer 
  for (let i = 0; i < factorDividends.length; i++) {
    if (Math.abs(output.dividend - windowDivedend) > Math.abs(factorDividends[i].dividend - windowDivedend)) output = factorDividends[i]
  }
  return output.factor
}

export const getFactors = (num) => {
  if (typeof num !== "number") return
  let factors = []
  for (let i = 0; i <= num; i++) {
    if (num % i === 0) {
      factors.push([i, num / i])
    }
  }
  return factors
}
export const checkAuth = _ => {
  const cookies = new Cookies();
  return new Promise((resolve, reject) => {
    if (cookies.get('userToken')) {
      fetch(`${SERVER_URL}api/users/me/${cookies.get('userToken')}`)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(err => resolve({error: true}))
    }
    else resolve({error: true})
  })
}
export const login = (data, action="login") => {
  let url = (action === 'login') ? SERVER_URL + "api/users/login" : SERVER_URL + "api/users/register"
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'POST', 
      mode: 'cors', 
      cache: 'no-cache', 
      credentials: 'same-origin', 
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer', 
      body: JSON.stringify(data) 
    })
      .then(response => response.json())
      .then((data) => {
        if (data.error) {
          reject(data.message)
          return
        } else {
          resolve(data) //set our jwt local storage in auth hook
        }
      })
  })
}
export function getContrastYIQ(hexcolor) {
  var r = parseInt(hexcolor.substr(0, 2), 16);
  var g = parseInt(hexcolor.substr(2, 2), 16);
  var b = parseInt(hexcolor.substr(4, 2), 16);
  var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}

