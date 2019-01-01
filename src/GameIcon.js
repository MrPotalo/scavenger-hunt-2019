import React, { Component } from 'react';

class GameIcon extends Component {
    render() {
        return (
            <div
                onClick={this.props.clickHandler}
                className={'gameIcon' + (this.props.Animate ? ' animate' : '')}
            >
                <img src={this.props.Icon} alt="gameIcon" />
                <span>{this.props.Name || 'hi'}</span>
            </div>
        );
    }
}

export default GameIcon;
