import React, { Component } from 'react';
import _ from 'lodash';

import '../styles/Physics.css';

class PhysicsGame extends Component {
    constructor(props) {
        super(props);

        let objects = [];
        if (props.Objects) {
            objects = props.Objects.map((obj, i) => {
                obj.width = obj.width || 50;
                obj.height = obj.height || 50;
                obj.position.x = obj.position.x || 0;
                obj.position.y = obj.position.y || 0;
                obj.velocity.x = obj.velocity.x || 0;
                obj.velocity.y = obj.velocity.y || 0;

                return obj;
            });
        }
        this.state = {
            width: props.Width || 500,
            height: props.Height || 300,
            gravity: props.Gravity || 1,
            objects,
        };
    }
    inputData = {
        keys: [],
        justPushed: keyCode => {
            if (this.inputData.keys[keyCode]) {
                return this.inputData.keys[keyCode].justPushed;
            }
            return false;
        },
        isHeld: keyCode => {
            if (this.inputData.keys[keyCode]) {
                return this.inputData.keys[keyCode].isHeld;
            }
            return false;
        },
    };
    keyDown = event => {
        event.preventDefault();
        let justPushed = true;
        if (
            this.inputData.keys[event.keyCode] &&
            this.inputData.keys[event.keyCode].isHeld
        ) {
            justPushed = false;
        }
        this.inputData.keys[event.keyCode] = { isHeld: true, justPushed };
    };
    keyUp = event => {
        this.inputData.keys[event.keyCode] = {
            isHeld: false,
            justPushed: false,
        };
    };

    componentDidMount() {
        document.addEventListener('keydown', this.keyDown, false);
        document.addEventListener('keyup', this.keyUp, false);
        this.timerId = setInterval(
            () => this.update(),
            1000 / (this.props.FPS || 30)
        );
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyDown, false);
        document.removeEventListener('keyup', this.keyUp, false);
        clearInterval(this.timerId);
    }

    getCenter = obj => {
        return {
            x: obj.position.x + obj.width / 2,
            y: obj.position.y + obj.height / 2,
        };
    };

    applyFriction = (obj, direction = 'x') => {
        if (direction === 'x') {
            let newXVelocity =
                obj.velocity.x +
                    (obj.velocity.x / Math.abs(obj.velocity.x)) *
                        -obj.friction || 0;
            if (
                (obj.velocity.x >= 0 && newXVelocity < 0) ||
                (obj.velocity.x <= 0 && newXVelocity > 0)
            ) {
                newXVelocity = 0;
            }
            obj.velocity.x = newXVelocity;
        } else if (direction === 'y') {
            let newYVelocity =
                obj.velocity.y +
                    (obj.velocity.y / Math.abs(obj.velocity.y)) *
                        -obj.friction || 0;
            if (
                (obj.velocity.y >= 0 && newYVelocity < 0) ||
                (obj.velocity.y <= 0 && newYVelocity > 0)
            ) {
                newYVelocity = 0;
            }
            obj.velocity.y = newYVelocity;
        }
    };

    update = () => {
        if (this.props.GameUpdate) {
            this.props.GameUpdate(this.inputData, this.state.objects);
        }
        this.inputData.keys.map(key => {
            key.justPushed = false;
            return key;
        });
        this.setState(oldState => {
            return {
                objects: oldState.objects.map((obj, i) => {
                    // static objects have no physics
                    if (obj.class === 'static') {
                        return obj;
                    }

                    // clamp speed if necessary
                    const xMax = _.get(obj, 'maxSpeed.x');
                    const yMax = _.get(obj, 'maxSpeed.y');
                    if (xMax) {
                        obj.velocity.x = _.clamp(obj.velocity.x, -xMax, xMax);
                    }
                    if (yMax) {
                        obj.velocity.y = _.clamp(obj.velocity.y, -yMax, yMax);
                    }

                    // apply gravity to objects with physics
                    if (
                        this.state.gravity &&
                        (obj.class === 'inelastic' || obj.class === 'elastic')
                    ) {
                        obj.velocity.y += this.state.gravity * 0.45;
                    }

                    // apply velocity to objects position
                    obj.position = {
                        x: obj.position.x + obj.velocity.x,
                        y: obj.position.y + obj.velocity.y,
                    };

                    // handle collisions with bounding box
                    if (obj.position.y > this.state.height - obj.height) {
                        obj.position.y = this.state.height - obj.height;
                        if (obj.class === 'inelastic') {
                            obj.velocity.y = 0;
                        } else if (obj.class === 'elastic') {
                            obj.velocity.y = -Math.abs(obj.velocity.y);
                        }
                    }
                    if (
                        obj.position.x > this.state.width - obj.width ||
                        obj.position.x < 0
                    ) {
                        if (obj.position.x < 0) {
                            obj.position.x = 0;
                        } else {
                            obj.position.x = this.state.width - obj.width;
                        }

                        if (obj.class === 'inelastic') {
                            obj.velocity.x = 0;
                        } else if (obj.class === 'elastic') {
                            if (obj.position.x === 0) {
                                obj.velocity.x =
                                    Math.abs(obj.velocity.x) *
                                    (obj.elasticity || 1);
                            } else {
                                obj.velocity.x =
                                    -Math.abs(obj.velocity.x) *
                                    (obj.elasticity || 1);
                            }
                        }
                    }

                    // handle all collisions
                    if (!obj.noCollide) {
                        _.map(this.state.objects, other => {
                            if (other === obj) {
                                return;
                            }
                            const objCenter = this.getCenter(obj);
                            const otherCenter = this.getCenter(other);
                            if (
                                Math.abs(objCenter.x - otherCenter.x) <
                                    (obj.width + other.width) / 2 &&
                                Math.abs(objCenter.y - otherCenter.y) <
                                    (obj.height + other.height) / 2
                            ) {
                                // collision
                                const rightDiff =
                                    other.position.x -
                                    (obj.position.x + obj.width);
                                const leftDiff =
                                    obj.position.x -
                                    (other.position.x + other.width);
                                const topDiff =
                                    obj.position.y -
                                    (other.position.y + other.height);
                                const bottomDiff =
                                    other.position.y -
                                    (obj.position.y + obj.height);
                                const side = Math.max(
                                    rightDiff,
                                    leftDiff,
                                    topDiff,
                                    bottomDiff
                                );
                                let collideInfo = {};
                                if (side === leftDiff) {
                                    collideInfo.left = true;
                                } else if (side === rightDiff) {
                                    collideInfo.right = true;
                                } else if (side === topDiff) {
                                    collideInfo.top = true;
                                } else if (side === bottomDiff) {
                                    collideInfo.bottom = true;
                                }

                                if (collideInfo.left) {
                                    // collision to left
                                    obj.position.x =
                                        other.position.x + other.width;
                                    if (obj.velocity.x - other.velocity.x < 0) {
                                        obj.velocity.x = other.velocity.x;
                                    }
                                }
                                if (collideInfo.right) {
                                    // collision to right
                                    obj.position.x =
                                        other.position.x - obj.width;
                                    if (other.velocity.x - obj.velocity.x < 0) {
                                        obj.velocity.x = other.velocity.x;
                                    }
                                }
                                if (collideInfo.top) {
                                    // collision to top
                                    obj.position.y =
                                        other.position.y + other.height;
                                    obj.velocity.y = other.velocity.y;
                                }
                                if (collideInfo.bottom) {
                                    obj.position.y =
                                        other.position.y - obj.height;
                                    obj.velocity.y = other.velocity.y;
                                }

                                // friction
                                if (collideInfo.top || collideInfo.bottom) {
                                    this.applyFriction(obj, 'x');
                                } else if (
                                    collideInfo.right ||
                                    collideInfo.left
                                ) {
                                    this.applyFriction(obj, 'y');
                                }
                            }
                        });
                    }

                    // friction
                    if (obj.position.y === this.state.height - obj.height) {
                        // on floor
                        this.applyFriction(obj, 'x');
                    }
                    if (
                        obj.position.x === 0 ||
                        obj.position.x === this.state.width - obj.width
                    ) {
                        this.applyFriction(obj, 'y');
                    }
                    return obj;
                }),
            };
        });
    };

    render() {
        return (
            <div
                id="physicsGame"
                style={{
                    width: this.state.width + 'px',
                    height: this.state.height + 'px',
                }}
            >
                {this.state.objects.map((obj, i) => {
                    return (
                        <div
                            key={i}
                            className="physicsBox"
                            style={{
                                left: obj.position.x + 'px',
                                top: obj.position.y + 'px',
                                width: obj.width + 'px',
                                height: obj.height + 'px',
                            }}
                        >
                            {obj.img ? (
                                <img
                                    src={obj.img.src}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        filter:
                                            'hue-rotate(' +
                                            obj.img.hue +
                                            'deg)',
                                    }}
                                />
                            ) : null}
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default PhysicsGame;
