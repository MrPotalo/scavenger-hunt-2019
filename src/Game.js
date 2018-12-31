import React, { Component } from 'react';
import './Game.css';

class Game extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div id="game">{this.props.children}</div>;
    }
}

export default Game;
