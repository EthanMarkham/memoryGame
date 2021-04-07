
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
export const checkAuth = () => {
  return new Promise((resolve, reject) => {
    let token = localStorage.getItem('jwt')
    if (token !== "undefined" && token) {
      fetch(`http://localhost:5000/api/users/me/${token}`)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(err => reject(err))
    }
    else resolve({error: true})
  })
}
export const login = (data, action="login") => {
  let url = (action === 'login') ? "http://localhost:5000/api/users/login" : "http://localhost:5000/api/users/register"
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
      .then(response => response.json())
      .then((data) => {
        console.log(data)
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

