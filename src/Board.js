import React, { Component } from 'react';
import './Board.css';
import _ from 'lodash';

class Board extends Component {
    constructor(props){
        super(props);
        let nums = _.concat(_.range(1, 13), _.range(1,13));
        console.log(nums);
        let grid = [];
        for (let y=0;y<5;y++){
            let row = [];
            for (let x=0;x<5;x++){
                let num;
                if (x === 2 && y === 2){
                    num = 0;
                    row[x] = num;
                    console.log("hi");
                }else{
                    num = Math.floor(Math.random()*nums.length);
                    row[x] = nums[num];
                    nums.splice(num, 1);
                }
            }
            grid[y] = row;
        }
        this.state = {
            grid
        }
    }
    render() {

      return (
          <div id="board">
              {this.state.grid.map((item, i) => {
                  return (
                  <div key={i} className="row">
                    {item.map((item2, i2) => {
                        return (
                            <div key={5*i + i2} className="card">{item2}</div>
                        )
                    }
                    )}
                  </div>
                  )
              })}
          </div>
      );
    }
  }
  
  export default Board;
  