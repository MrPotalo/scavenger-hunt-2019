import React, { Component } from 'react';
import './App.css';
import Board from './Board.js';
import Maze from './Maze.js';
import Game from './Game.js';
import GameList from './GameList.js';
import _ from 'lodash';
import tato from './images/tato.png';
import unicorn from './images/unicorn.png';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            game: null,
        };
    }

    tryCode = event => {
        if (event.keyCode === 13) {
            const text = _.toLower(event.target.value);
            if (text === 'potato') {
                this.setState({ game: 1 });
            } else if (text === 'unicorn') {
                this.setState({ game: 2 });
            } else {
                event.target.value = '';
            }
        }
    };

    render() {
        let html;
        switch (this.state.game) {
            case 1:
                html = (
                    <Game>
                        <Board />
                    </Game>
                );
                break;
            case 2:
                html = (
                    <Game>
                        <Maze Size={process.env.MAZE_SIZE || 10} />
                    </Game>
                );
                break;
            default:
                html = (
                    <GameList>
                        <Game Name="Match" Icon={tato}>
                            <Board />
                        </Game>
                        <Game Name="Maze" Icon={unicorn}>
                            <Maze Size={process.env.MAZE_SIZE || 10} />
                        </Game>
                    </GameList>
                );
                break;
        }
        return <div className="App">{html}</div>;
    }
}

export default App;
