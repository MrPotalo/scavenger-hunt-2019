import React, { Component } from 'react';
import './App.css';
import Board from './Board.js';
import Maze from './Maze.js';
import _ from 'lodash';

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
            } else if (text === 'tomato') {
                this.setState({ game: 2 });
            } else {
                event.target.value = '';
            }
        }
    };

    render() {
        let html = (
            <div id="codeBox">
                <span>Input secret code: </span>
                <input onKeyDown={this.tryCode} type="password" />
            </div>
        );
        switch (this.state.game) {
            case 1:
                html = <Board />;
                break;
            case 2:
                html = <Maze />;
                break;
        }
        return <div className="App">{html}</div>;
    }
}

export default App;
