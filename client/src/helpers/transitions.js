import { config } from 'react-spring'

export const squareSprings = (item) => {
    console.log(item)
    if (item.flipping) return {
        from: { transform: `perspective(600px) rotateY(-90deg)`, opacity: 1 },
        to: { opacity: 1, transform: `perspective(600px) sharotateY(0deg)`},//transform: 'rotateY(0)' },
        leave: { opacity: 1, transform: `perspective(600px) rotateY(90deg)`},//transform: 'rotateY(0)' },
        config: {duration: 0}
    }
    else if (item.newSquare) {
        let randomDelay = Math.random()*1000+1000
        return {
            from: { transform: `perspective(600px)`, opacity: 0 },
            to: { opacity: 1,}, //transform: `` },
            config: {...config.gentle, duration: randomDelay},
            delay: 100
        }
    }
    else return {to: {opacity: 1}}
}

const calc = (x, y) => [-(y - window.innerHeight / 2) / 20, (x - window.innerWidth / 2) / 20, 1.1]
const trans = (x, y, s) => `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`


export const errorTransition = {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: {opacity: 0}
}

export const pageTransition = {
    from: { opacity: 1, transform: 'translate(-100%)' }, //rotateY(90deg)
    enter: { opacity: 1, transform: 'translate(0);'}, //rotateY(0deg) 
    leave: { opacity: 1, transform: 'translate(100%)'}, //rotateY(90deg)
    config: config.default
}