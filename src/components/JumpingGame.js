import React, { Component } from 'react';
import _ from 'lodash';

import PhysicsGame from './PhysicsGame.js';

import avalancheBlock from '../images/Avalanche_Block.png';

class JumpingGame extends Component {
    gameUpdate = (input, objects) => {
        this.blockDrop++;
        if (this.blockDrop === 300) {
            this.blockDrop = 0;
            const size = Math.floor(Math.random() * 50) + 50;
            const block = {
                id: 'block',
                img: {
                    src: avalancheBlock,
                    hue: Math.floor(Math.random() * 360),
                },
                class: 'inelastic',
                width: size,
                height: size,
                velocity: { x: 0, y: 1 },
                maxSpeed: { y: 1 },
                position: {
                    x: Math.floor(Math.random() * (500 - size)),
                    y: -size,
                },
            };
            objects.push(block);
        }
        let player = _.find(objects, { id: 'player' });
        if (input.justPushed(38)) {
            player.velocity.y = -10;
        }
        if (input.isHeld(37)) {
            player.velocity.x -= 0.3;
        } else if (input.isHeld(39)) {
            player.velocity.x += 0.3;
        }
    };
    blockDrop = 0;

    render() {
        return (
            <PhysicsGame
                Width={500}
                Height={900}
                GameUpdate={this.gameUpdate}
                KeyDown={this.keyDown}
                FPS={60}
                Objects={[
                    {
                        id: 'player',
                        class: 'inelastic',
                        position: { x: 225, y: 250 },
                        velocity: { x: 0, y: 0 },
                        friction: 0.14,
                        elasticity: 0.8,
                        maxSpeed: { x: 6 },
                    },
                ]}
            />
        );
    }
}

export default JumpingGame;
