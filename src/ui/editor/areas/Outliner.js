import React from 'react';
import {map} from 'lodash';
import FrameListener from '../../utils/FrameListener';
import DebugData from '../DebugData';

class OutlinerContent extends FrameListener {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return <ul>
            {
                map(this.state.actors, (actor, idx) => {
                    return <li key={idx} style={{fontSize: 20, cursor: 'pointer'}}>Actor {idx}</li>;
                })
            }
        </ul>;
    }

    frame() {
        const scene = DebugData.scope.scene;
        if (scene) {
            this.setState({actors: scene.actors});
        }
    }
}

const Outliner = {
    name: 'Outliner',
    content: OutlinerContent,
    getInitialState: () => ({})
};

export default Outliner;

