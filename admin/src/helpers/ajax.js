export const checkAuth = () => {
  return new Promise((resolve, reject) => {
    let token = localStorage.getItem('jwt')
    if (token !== "undefined" && token) {
      fetch(`http://localhost:5000/api/admin/me/${token}`)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(err => reject(err))
    }
    else resolve({error: true})
  })
}
export const login = data => {
  const url = "http://localhost:5000/api/admin/login"
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
export const getGames = () => {
  return new Promise((resolve, reject) => {
    let token = localStorage.getItem('jwt')
    if (token !== "undefined" && token) {
      fetch(`http://localhost:5000/api/admin/getGames/${token}`)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(err => reject(err))
    }
    else resolve({error: true})
  })
}
export const removeUser = userID => {
  return new Promise((resolve, reject) => {
    let token = localStorage.getItem('jwt')
    if (token !== "undefined" && token) {
      fetch(`http://localhost:5000/api/admin/removeUser/${token}/${userID}`)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(err => reject(err))
    }
    else resolve({error: true})
  })
}
export const deleteGame = gameID => {
  return new Promise((resolve, reject) => {
    let token = localStorage.getItem('jwt')
    if (token !== "undefined" && token) {
      fetch(`http://localhost:5000/api/admin/deleteGame/${token}/${gameID}`)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(err => reject(err))
    }
    else resolve({error: true})
  })
}
