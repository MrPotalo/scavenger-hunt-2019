import React, { Component } from 'react';
import _ from 'lodash';

import PhysicsGame from './PhysicsGame.js';

import avalancheBlock from '../images/Avalanche_Block.png';

class JumpingGame extends Component {
    canJump = 0;
    jumpStrength = null;
    highestBlock = 500;
    gameUpdate = (data, objects) => {
        if (this.canJump <= 0) {
            this.jumpStrength = null;
        } else {
            this.canJump--;
        }
        data.collisions.map(collision => {
            if (
                collision.obj.id === 'block' &&
                collision.other.class === 'static'
            ) {
                collision.obj.class = 'static';
                if (collision.obj.position.y < this.highestBlock) {
                    this.highestBlock = collision.obj.position.y;
                }
            }
            if (collision.obj.id === 'player') {
                if (collision.side.bottom) {
                    this.jumpStrength = { x: null, y: -10 };
                } else if (collision.side.left) {
                    this.jumpStrength = { x: 3, y: -10 };
                    this.canJump = 5;
                } else if (collision.side.right) {
                    this.jumpStrength = { x: -3, y: -10 };
                    this.canJump = 5;
                }
            }
        });
        this.blockDrop++;
        let player = _.find(objects, { id: 'player' });
        if (this.blockDrop === 120) {
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
                    y: this.highestBlock - 700 - size,
                },
            };
            objects.push(block);
        }
        if (data.input.justPushed(38) && this.jumpStrength) {
            player.velocity.y = this.jumpStrength.y;
            player.velocity.x = this.jumpStrength.x || player.velocity.x;
        }
        if (data.input.isHeld(37)) {
            player.velocity.x -= 0.3;
        } else if (data.input.isHeld(39)) {
            player.velocity.x += 0.3;
        }
    };
    blockDrop = 0;

    render() {
        return (
            <PhysicsGame
                Width={500}
                Height={600}
                GameUpdate={this.gameUpdate}
                KeyDown={this.keyDown}
                FPS={60}
                CameraClamp="player"
                Offset={{ x: 0, y: 100 }}
                Objects={[
                    {
                        id: 'player',
                        class: 'inelastic',
                        color: '#0d0',
                        position: { x: 225, y: 500 },
                        velocity: { x: 0, y: 0 },
                        friction: 0.14,
                        elasticity: 0.8,
                        maxSpeed: { x: 6 },
                    },
                    {
                        id: 'floor',
                        class: 'static',
                        color: '#000',
                        position: { x: 0, y: 595 },
                        velocity: { x: 0, y: 0 },
                        width: 500,
                        height: 5,
                    },
                ]}
            />
        );
    }
}

export default JumpingGame;
