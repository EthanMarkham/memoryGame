import { config } from 'react-spring'

export const squareAnimations = {
    from: {opacity: 0},
    enter: {opacity: 1},
    leave:({
        opacity: 0,
    }),
    trail: 20
}

export const errorTransition = {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: {opacity: 0}
}

export const timerTransition = {
    from: { opacity: 0 },
    enter: {opacity: 1},
    leave: {opacity: 0}

}
export const pageTransition = {
    from: { opacity: 1, transform: 'translate(-100%)' }, //rotateY(90deg)
    enter: { opacity: 1, transform: 'translate(0);'}, //rotateY(0deg) 
    leave: { opacity: 1, transform: 'translate(100%)'}, //rotateY(90deg)
    config: config.default
}