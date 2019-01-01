import React, { Component } from 'react';
import './Game.css';

class Game extends Component {
    render() {
        return (
            <div id="gameContainer">
                <div id="backButton" onClick={this.props.backHandler}>
                    {'Back'}
                </div>
                <div id="game">{this.props.children}</div>
            </div>
        );
    }
}

export default Game;
