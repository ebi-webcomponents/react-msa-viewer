/**
* Copyright 2018, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

import msaConnect from '../store/connect'
import { updatePosition } from '../store/actions'
import PropTypes from 'prop-types';

import { floor, clamp } from 'lodash-es';

import DraggingComponent from './DraggingComponent';

// TODO: maybe move into the store
const schemes = new (require('msa-colorschemes'))();

class SequenceViewerComponent extends DraggingComponent {

  static fps = 120;

  /**
   * Draws the currently visible sequences.
   * Called on every sequence movement.
   */
  drawScene() {
    // TODO: only update the scheme when it changed (maybe move i
    this.scheme = schemes.getScheme(this.props.colorScheme);

    const sequences = this.props.sequences.raw;
    const tileWidth = this.props.tileWidth;
    const tileHeight = this.props.tileHeight;
    const {xPos: xViewPos, yPos: yViewPos} = this.props.position;
    const xInitPos = -(xViewPos % tileWidth);
    let yPos = -(yViewPos % tileHeight);
    // TODO: move into the reducer
    let i = clamp(floor(yViewPos / tileHeight), 0, sequences.length - 1);
    for (; i < sequences.length; i++) {
      const sequence = sequences[i].sequence;
      let xPos = xInitPos;
      let j = clamp(floor(xViewPos / tileWidth), 0, sequence.length - 1);
      for (; j < sequence.length; j++) {
        const el = sequence[j];
        this.ctx.font(this.props.tileFont);
        this.ctx.fillStyle(this.scheme.getColor(el));
        this.ctx.globalAlpha(0.7);
        this.ctx.fillRect(xPos, yPos, tileWidth, tileHeight);
        this.ctx.fillStyle("#000000");
        this.ctx.globalAlpha(1.0);
        // TODO: center the font tile
        this.ctx.fillText(el, xPos, yPos, tileWidth, tileHeight);
        xPos += tileWidth;
        if (xPos > this.props.width)
            break;
      }
      yPos += tileHeight;
      if (yPos > this.props.height)
          break;
    }
  }

  onPositionUpdate(oldPos, newPos) {
    // TODO: move this into a redux action
    const pos = this.props.position;
    pos.xPos += oldPos[0] - newPos[0];
    pos.yPos += oldPos[1] - newPos[1];
    // TODO: need maximum of sequence lengths here
    const maximum = this.props.sequences.maxLength;
    const maxWidth = maximum * this.props.tileWidth - this.props.width;
    pos.xPos = clamp(pos.xPos, 0, maxWidth);
    const maxHeight = this.props.sequences.raw.length * this.props.tileHeight - this.props.height;
    pos.yPos = clamp(pos.yPos, 0, maxHeight);
    this.props.updatePosition(pos);
  }

  componentDidUpdate() {
    // TODO: smarter updates
    this.draw();
  }

  //shouldComponentUpdate(newProps) {
    //// TODO: check recursively
    ////return this.props.target !== newProps.target;
    //return true;
  //}
}

SequenceViewerComponent.defaultProps = {
  showModBar: true,
};

SequenceViewerComponent.PropTypes = {
  /**
   * Show the custom ModBar
   */
  showModBar: PropTypes.boolean,
};

const mapStateToProps = state => {
  return {
    position: state.position,
    sequences: state.sequences,
    width: state.props.width,
    height: state.props.height,
    tileWidth: state.props.tileWidth,
    tileHeight: state.props.tileHeight,
    tileFont: state.props.tileFont,
    msecsPerFps: state.props.msecsPerFps,
    colorScheme: state.props.colorScheme,
    engine: state.props.engine,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updatePosition: (view) => dispatch(updatePosition(view)),
  }
}

export default msaConnect(
  mapStateToProps,
  mapDispatchToProps,
)(SequenceViewerComponent);
