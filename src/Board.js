import React, { Component } from 'react';
import './Board.css';
import _ from 'lodash';
import Card from './Card.js';
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants';

class Board extends Component {
    constructor(props){
        super(props);
        let nums = _.concat(_.range(1, 13), _.range(1,13));
        console.log(nums);
        let grid = [];
        for (let i=0;i<25;i++){
            let num;
            if (i === 12){
                num = 0;
                grid[i] = {value: num, state: 'ready'};
            }else{
                num = Math.floor(Math.random()*nums.length);
                grid[i] = {value: nums[num], state: 'ready'};
                nums.splice(num, 1);
            }
        }
        this.state = {
            grid,
            selected: null,
            canClick: true,
            done: false
        }
    }

    handleClick = event => {
        if (!this.state.canClick)
            return;
        event.preventDefault();
        const cardId = event.target.id;
        let grid = this.state.grid.slice();
        let selected = this.state.selected;
        grid[cardId].state = 'flipped';
        this.setState({grid, selected: selected || cardId});
        if (selected === null){
            selected = cardId;
        }else if (selected != cardId){
            if (grid[cardId].value === grid[selected].value){
                grid[cardId].state = 'done';
                grid[selected].state = 'done';
                this.setState({grid, canClick: true, selected: null});
                if (_.filter(grid, {state: 'ready'}).length == 1){
                    this.setState({canClick: false, done: true})
                }
            }else {
                this.setState({canClick: false});
                setTimeout(() => {
                    grid[cardId].state = 'ready';
                    grid[this.state.selected].state = 'ready';
                    this.setState({grid, selected: null, canClick: true});
                }, 1000)
            }
        }
        
    }

    render() {

      return (
          <div id="board">
              {this.state.grid.map((item, i) => {
                return (
                    <div key={i} className="cardContainer">
                        <Card done={this.state.done} handleClick={this.handleClick} key={i} isFlipped={item.state !== 'ready'} id={i} cardValue={item.value}></Card>
                    </div>
                )
              })}
          </div>
      );
    }
  }
  
  export default Board;
  