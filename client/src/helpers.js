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
  export const login = () => {
    return new Promise((resolve, reject) => {
      let token = localStorage.getItem('jwt')
      if (token !== "undefined" && token) {
        fetch(`http://localhost:5000/api/users/me/${token}`)
          .then(response => response.json())
          .then(data => resolve(data))
          .catch(err => reject(err))
      }
      else reject(false)
    })
  }