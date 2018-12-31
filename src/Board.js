import React, { Component } from 'react';
import './Board.css';
import _ from 'lodash';
import Card from './Card.js';
import ImagePreload from './ImagePreload.js';
import fart from './audio/Fart.mp3';
import woo from './audio/Woo.mp3';
import click from './audio/Click.mp3';

class Board extends Component {
    constructor(props) {
        super(props);
        let nums = _.concat(_.range(1, 13), _.range(1, 13));
        console.log(nums);
        let grid = [];
        for (let i = 0; i < 25; i++) {
            let num;
            if (i === 12) {
                num = 0;
                grid[i] = { value: num, state: 'ready' };
            } else {
                num = Math.floor(Math.random() * nums.length);
                grid[i] = { value: nums[num], state: 'ready' };
                nums.splice(num, 1);
            }
        }
        this.state = {
            grid,
            selected: null,
            canClick: true,
            done: false,
            misses: 0,
        };
    }

    handleClick = event => {
        if (!this.state.canClick || event.target.className !== 'front') return;
        document.getElementById('clickAudio').play();
        event.preventDefault();
        const cardId = event.target.id;
        let grid = this.state.grid.slice();
        let selected = this.state.selected;
        grid[cardId].state = 'flipped';
        this.setState({ grid, selected: selected || cardId });
        if (selected === null) {
            selected = cardId;
        } else if (selected !== cardId) {
            if (grid[cardId].value === grid[selected].value) {
                document.getElementById('wooAudio').play();
                grid[cardId].state = 'done';
                grid[selected].state = 'done';
                this.setState({ grid, canClick: true, selected: null });
                if (_.filter(grid, { state: 'ready' }).length === 1) {
                    this.setState({ canClick: false, done: true });
                }
            } else {
                this.setState(state => {
                    return { canClick: false, misses: state.misses + 1 };
                });
                document.getElementById('fartAudio').play();
                setTimeout(() => {
                    grid[cardId].state = 'ready';
                    grid[this.state.selected].state = 'ready';
                    this.setState({ grid, selected: null, canClick: true });
                }, 1000);
            }
        }
    };

    render() {
        return (
            <div id="board">
                <div style={{ height: '100%', width: '100%' }}>
                    {this.state.grid.map((item, i) => {
                        return (
                            <div key={i} className="cardContainer">
                                <Card
                                    done={this.state.done}
                                    handleClick={this.handleClick}
                                    key={i}
                                    isFlipped={item.state !== 'ready'}
                                    id={i}
                                    cardValue={item.value}
                                />
                            </div>
                        );
                    })}
                </div>
                <div style={{ whiteSpace: 'nowrap' }} id="stats">
                    {'Misses: ' + this.state.misses}
                </div>
                <ImagePreload />
                <audio id="fartAudio" src={fart} />
                <audio id="wooAudio" src={woo} />
                <audio id="clickAudio" src={click} />
            </div>
        );
    }
}

export default Board;
