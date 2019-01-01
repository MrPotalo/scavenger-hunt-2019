import React, { Component } from 'react';
import './GameList.css';
import GameIcon from './GameIcon.js';
import logo from './images/LOGO.png';

class GameList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gameId: null,
        };
    }

    handleBackClick = e => {
        this.setState({ gameId: null, animate: false });
    };

    handleClick = (e, i) => {
        this.setState({ gameId: i, animate: true });
        setTimeout(() => {
            this.setState({ animate: false });
        }, 1000);
    };

    render() {
        if (!this.state.animate && this.state.gameId !== null) {
            return React.cloneElement(this.props.children[this.state.gameId], {
                backHandler: this.handleBackClick,
            });
        }
        return (
            <div>
                <div style={{ display: 'inline-block', height: '100%' }}>
                    <img id="logo" src={logo} alt="logo" />
                </div>
                <div id="gameList">
                    {this.props.children.map((game, i) => {
                        return (
                            <GameIcon
                                key={i}
                                Animate={this.state.gameId === i}
                                Icon={game.props.Icon}
                                Name={game.props.Name}
                                clickHandler={e => this.handleClick(e, i)}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default GameList;
