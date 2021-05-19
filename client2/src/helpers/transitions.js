import { config } from 'react-spring'

export const squareTransitions = {
    from: { opacity: 0 },
    to: { opacity: 1 },
    enter: { opacity: 1 },
    leave: ({
        opacity: 0,
    }),
    keys: item => item.id,
    reset: false,
    trail: 30, //if change change hideDelay in game.jsx
}
export const flipAnimations = s => ({
    transitionDelay: (s.flipping && s.value === "*") ? '0.25s' : '0',
    opacity: s.flipped ? 1 : 0,
    display: s.flipped ? 'block' : 'none',
    transform: `perspective(600px) rotateX(${s.flipped ? 180 : 0}deg)`,
    //xys: [0, 0, 1],
    config: { mass: 5, tension: 500, friction: 70 },
})
//export const calc = (x, y) => [-(y - window.innerHeight / 2) / 20, (x - window.innerWidth / 2) / 20, 1.1]
//export const trans = (x, y, s) => `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`

export const errorTransition = {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
}

export const timerTransition = {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }

}
export const pageTransition = {
    from: { opacity: 0, }, //rotateY(90deg) transform: 'translate(-100%)'
    enter: { opacity: 1, }, //rotateY(0deg) transform: 'translate(0);'
    leave: { opacity: 0, }, //rotateY(90deg) transform: 'translate(100%)'
    keys: item => 'page' + item,
    config: config.default
}

export const endGameTransition = {
    from: { display: 'hidden' },
    to: { opacity: 1, transform: 'translate(0);' },
    leave: { opacity: 1, transform: 'translate(100%)' }, //rotateY(90deg)
    config: config.default,
}
export const hideGameInfo = show => ({
    from: {
        opacity: 0,
        transformOrigin: 'translate(-100%)',
    }, //rotateY(90deg)
    to: show ?
        {
            transform: 'translate(0)',
            opacity: 1
        } : {
            display: 'none'
        }
    , //rotateY(0deg) 
    leave: { transform: 'translate(-100%)' }, //rotateY(90deg)
    config: { duration: 600 },
})

export const gameOverTransition = show => ({
    from: {
        transformOrigin: 'scale(0)',
    }, //rotateY(90deg)
    to: show ? {
        transform: 'scale(1)',
        display: 'block'
    } : { display: 'none' },
    leave: { transform: 'translate(-100%)' }, //rotateY(90deg)
    config: config.molasses,
    delay: 500
})

export const hideBoardAnimation = show => ({
    to: {
        display: show ? 'flex-grid' : 'none'
    }
})