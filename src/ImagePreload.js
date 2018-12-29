import React, { Component } from 'react';

import egg from './images/egg.png';
import egg1 from './images/egg1.png';
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
import clue2 from './images/clue2.png';

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
    clue2,
];

class ImagePreload extends Component {
    render() {
        return (
            <div>
                {images.concat(egg).map((img, i) => {
                    return (
                        <img
                            key={i}
                            src={img}
                            alt="preloaded"
                            style={{ display: 'none' }}
                        />
                    );
                })}
            </div>
        );
    }
}

export default ImagePreload;
