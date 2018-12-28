import React, { Component } from 'react';
import './Maze.css';
import ImagePreload from './ImagePreload.js';
import _ from 'lodash';
import playerImg from './images/egg1.png';
import egg from './images/egg.png';
import tato from './images/tato.png';

const SIZE = 12;

class Maze extends Component {
    constructor(props) {
        super(props);

        let grid = [];
        for (let i = 0; i < SIZE; i++) {
            let row = [];
            for (let x = 0; x < SIZE; x++) {
                // top, right, bottom, left, visited, potato
                row.push([1, 1, 1, 1, false, false]);
            }
            grid.push(row);
        }
        let startCell = [
            Math.floor(Math.random() * SIZE),
            Math.floor(Math.random() * SIZE),
        ];
        let visited = 1;
        let path = [startCell];
        grid[startCell[0]][startCell[1]][4] = true;
        while (visited < SIZE * SIZE) {
            let potential = [
                [startCell[0] - 1, startCell[1], 0, 2],
                [startCell[0], startCell[1] + 1, 1, 3],
                [startCell[0] + 1, startCell[1], 2, 0],
                [startCell[0], startCell[1] - 1, 3, 1],
            ];
            let neighbors = [];
            for (let i = 0; i < 4; i++) {
                if (
                    potential[i][0] > -1 &&
                    potential[i][0] < SIZE &&
                    potential[i][1] > -1 &&
                    potential[i][1] < SIZE &&
                    !grid[potential[i][0]][potential[i][1]][4]
                ) {
                    neighbors.push(potential[i]);
                }
            }
            if (neighbors.length) {
                let next =
                    neighbors[Math.floor(Math.random() * neighbors.length)];
                grid[startCell[0]][startCell[1]][next[2]] = 0;
                grid[next[0]][next[1]][next[3]] = 0;
                grid[next[0]][next[1]][4] = true;
                visited++;
                startCell = [next[0], next[1]];
                path.push(startCell);
            } else {
                startCell = path.pop();
            }
        }
        for (let i = 0; i < SIZE; i++) {
            let pos = [
                Math.floor(Math.random() * SIZE),
                Math.floor(Math.random() * SIZE),
            ];
            grid[pos[0]][pos[1]][5] = true;
        }
        this.state = {
            grid,
            player: [0, 0],
            won: false,
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', this.keyPressed, false);
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyPressed, false);
    }

    keyPressed = event => {
        console.log(event.keyCode);
        let playerPos = this.state.player;
        if (event.keyCode === 37 || event.keyCode === 65) {
            if (
                playerPos[1] > 0 &&
                this.state.grid[playerPos[0]][playerPos[1]][3] === 0
            ) {
                playerPos[1]--;
            }
        } else if (event.keyCode === 38 || event.keyCode === 87) {
            if (
                playerPos[0] > 0 &&
                this.state.grid[playerPos[0]][playerPos[1]][0] === 0
            ) {
                playerPos[0]--;
            }
        } else if (event.keyCode === 39 || event.keyCode === 68) {
            if (
                playerPos[1] < SIZE - 1 &&
                this.state.grid[playerPos[0]][playerPos[1]][1] === 0
            ) {
                playerPos[1]++;
            }
        } else if (event.keyCode === 40 || event.keyCode === 83) {
            if (
                playerPos[0] < SIZE - 1 &&
                this.state.grid[playerPos[0]][playerPos[1]][2] === 0
            ) {
                playerPos[0]++;
            }
        }
        let won = false;
        if (this.state.grid[playerPos[0]][playerPos[1]][5]) {
            this.setState(lastState => {
                let newGrid = lastState.grid;
                newGrid[playerPos[0]][playerPos[1]][5] = false;
                return { grid: newGrid };
            });
            let dropsLeft = this.state.grid.reduce((acc, row) => {
                return (
                    acc +
                    row.reduce((acc2, col) => {
                        return acc2 + (col[5] ? 1 : 0);
                    }, 0)
                );
            }, 0);
            console.log(dropsLeft);
            if (dropsLeft === 0) {
                won = true;
            }
        }
        this.setState({ player: playerPos, won });
    };

    render() {
        return (
            <div id="maze">
                {this.state.won ? (
                    <img src={egg} />
                ) : (
                    this.state.grid.map((row, r) => {
                        return (
                            <div
                                key={r}
                                className="row"
                                style={{ height: 100 / SIZE + '%' }}
                            >
                                {row.map((cell, c) => {
                                    let walls = 'cell';
                                    if (cell[0] > 0) {
                                        walls += ' top';
                                    }
                                    if (cell[1] > 0) {
                                        walls += ' right';
                                    }
                                    if (cell[2] > 0) {
                                        walls += ' bottom';
                                    }
                                    if (cell[3] > 0) {
                                        walls += ' left';
                                    }
                                    let innards;
                                    if (
                                        r === this.state.player[0] &&
                                        c === this.state.player[1]
                                    ) {
                                        innards = (
                                            <img id="player" src={playerImg} />
                                        );
                                    } else if (this.state.grid[r][c][5]) {
                                        innards = (
                                            <img className="drop" src={tato} />
                                        );
                                    }
                                    return (
                                        <div
                                            className={walls}
                                            style={{ width: 100 / SIZE + '%' }}
                                            key={c}
                                        >
                                            {innards}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                )}
                <ImagePreload />
            </div>
        );
    }
}

export default Maze;
