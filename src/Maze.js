import React, { Component } from 'react';
import './Maze.css';
import ImagePreload from './ImagePreload.js';
import playerImg from './images/unicorn.png';
import clue2 from './images/clue2.png';
import tato from './images/tato.png';
import slurp from './audio/Slurp1.mp3';
import slurp2 from './audio/Slurp2.mp3';

class Maze extends Component {
    constructor(props) {
        super(props);

        let grid = [];
        for (let i = 0; i < this.props.Size; i++) {
            let row = [];
            for (let x = 0; x < this.props.Size; x++) {
                // top, right, bottom, left, visited, potato
                row.push([1, 1, 1, 1, false, false]);
            }
            grid.push(row);
        }
        let startCell = [
            Math.floor(Math.random() * this.props.Size),
            Math.floor(Math.random() * this.props.Size),
        ];
        let visited = 1;
        let path = [startCell];
        grid[startCell[0]][startCell[1]][4] = true;
        while (visited < this.props.Size * this.props.Size) {
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
                    potential[i][0] < this.props.Size &&
                    potential[i][1] > -1 &&
                    potential[i][1] < this.props.Size &&
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
        // initialize potatos
        for (let i = 0; i < this.props.Size; i++) {
            let pos = [
                Math.floor(Math.random() * this.props.Size),
                Math.floor(Math.random() * this.props.Size),
            ];
            if (pos[0] !== 0 && pos[1] !== 0) {
                grid[pos[0]][pos[1]][5] = true;
            }
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
                playerPos[1] < this.props.Size - 1 &&
                this.state.grid[playerPos[0]][playerPos[1]][1] === 0
            ) {
                playerPos[1]++;
            }
        } else if (event.keyCode === 40 || event.keyCode === 83) {
            if (
                playerPos[0] < this.props.Size - 1 &&
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
            let audioElement = document.getElementById('slurpAudio');
            if (dropsLeft === 0) {
                audioElement.src = slurp2;
                won = true;
            }
            audioElement.play();
        }
        this.setState({ player: playerPos, won });
    };

    render() {
        return (
            <div id="maze">
                {this.state.won ? (
                    <img id="clue" src={clue2} alt="clue" />
                ) : (
                    this.state.grid.map((row, r) => {
                        return (
                            <div
                                key={r}
                                className="row"
                                style={{ height: 100 / this.props.Size + '%' }}
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
                                            <img
                                                id="player"
                                                src={playerImg}
                                                alt="player"
                                            />
                                        );
                                    } else if (this.state.grid[r][c][5]) {
                                        innards = (
                                            <img
                                                className="drop"
                                                src={tato}
                                                alt="src"
                                            />
                                        );
                                    }
                                    return (
                                        <div
                                            className={walls}
                                            style={{
                                                width:
                                                    100 / this.props.Size + '%',
                                            }}
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
                <audio id="slurpAudio" src={slurp} />
            </div>
        );
    }
}

export default Maze;
