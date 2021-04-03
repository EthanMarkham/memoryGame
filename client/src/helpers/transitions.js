export const squareTransition = {
    from: { transform: `perspective(600px) rotateX(360deg)`, opacity: 0 },
    to: { opacity: 1 },
    leave: { opacity: 0 },
    enter: { transform: `perspective(600px) rotateX(360deg)`, opacity: 1 },
    initial: { transform: `perspective(600px) rotateX(360deg)`, opacity: 0 },
    //update: { transform: `perspective(600px) rotateX(360px)`, opacity: 1 },
    unique: true,
    // trail: 50,
    config: { delay: 500 },
}
const calc = (x, y) => [-(y - window.innerHeight / 2) / 20, (x - window.innerWidth / 2) / 20, 1.1]
const trans = (x, y, s) => `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`


export const errorTransition = {
    from: { top: '0', left: '0' },
    to: async next => {
        await next({ left: '50%', top: '20%', opacity: 1 })
        await next({ opacity: 0, display: 'hidden' })
    },
    reset: true,
    config: { duration: 5000 }
}

export const pageTransition = {
    from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
    enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
}