import React from 'react';

import egg1 from './images/egg1.png';
import egg from './images/egg.png';
import apple from './images/apple.jpg';
import banana from './images/bananas.jpg';
import milk from './images/milk.png';
import carrot from './images/carrot.jpg';
import snel from './images/Snel.png';
import cat from './images/cat.jpg';
import doggo from './images/doggo.jpg';
import tato from './images/tato.png';
import taco from './images/taco.jpg';
import burgus from './images/burgus.png';
import hors from './images/hors.jpg';
import creb from './images/creb.jpg';

const images = [
    egg1,
    apple,
    banana,
    milk,
    carrot,
    snel,
    cat,
    doggo,
    tato,
    taco,
    burgus,
    hors,
    creb,
];

const Card = ({ id, done, isFlipped, handleClick, cardValue }) =>
    !(id === 12 && done) ? (
        <div
            style={done ? { display: 'none' } : {}}
            className={'card' + (isFlipped ? ' flipped' : '')}
        >
            <div id={id} className="front" onClick={handleClick} />
            <div className="back">
                <img src={images[cardValue]} alt={images[cardValue].fileName} />
            </div>
        </div>
    ) : (
        <img className="clue" src={egg} alt="EGGCLUE" />
    );

export default Card;
