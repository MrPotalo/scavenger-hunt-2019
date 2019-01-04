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
    data = {
        input: {
            keys: [],
            justPushed: keyCode => {
                if (this.data.input.keys[keyCode]) {
                    return this.data.input.keys[keyCode].justPushed;
                }
                return false;
            },
            isHeld: keyCode => {
                if (this.data.input.keys[keyCode]) {
                    return this.data.input.keys[keyCode].isHeld;
                }
                return false;
            },
        },
        collisions: [],
    };
    keyDown = event => {
        event.preventDefault();
        let justPushed = true;
        if (
            this.data.input.keys[event.keyCode] &&
            this.data.input.keys[event.keyCode].isHeld
        ) {
            justPushed = false;
        }
        this.data.input.keys[event.keyCode] = { isHeld: true, justPushed };
    };
    keyUp = event => {
        this.data.input.keys[event.keyCode] = {
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
            this.props.GameUpdate(this.data, this.state.objects);
        }
        this.data.input.keys.map(key => {
            key.justPushed = false;
            return key;
        });
        this.data.collisions = [];
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
                            this.data.collisions.push({
                                obj,
                                other: '_left',
                                side: { left: true },
                            });
                        } else {
                            obj.position.x = this.state.width - obj.width;
                            this.data.collisions.push({
                                obj,
                                other: '_right',
                                side: { right: true },
                            });
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
                    if (!obj.noCollide || obj.class === 'static') {
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
                                this.data.collisions.push({
                                    obj,
                                    other,
                                    side: collideInfo,
                                });

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
        let offset = this.props.Offset
            ? Object.assign({}, this.props.Offset)
            : { x: 0, y: 0 };
        if (this.props.CameraClamp) {
            const clampTo = _.find(this.state.objects, {
                id: this.props.CameraClamp,
            });
            if (clampTo) {
                offset.y += this.props.Height / 2 - clampTo.position.y;
                console.log(offset.y);
            }
        }
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
                                left: offset.x + obj.position.x + 'px',
                                top: offset.y + obj.position.y + 'px',
                                width: obj.width + 'px',
                                height: obj.height + 'px',
                                backgroundColor: obj.color || '#000',
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
