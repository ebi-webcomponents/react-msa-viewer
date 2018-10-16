/**
* Copyright 2018, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import msaConnect from '../store/connect'

import { throttle, floor, clamp } from 'lodash-es';

import Canvas from '../drawing/canvas';

import createRef from 'create-react-ref/lib/createRef';

const schemes = new (require('msa-colorschemes'))();

class SequenceOverviewComponent extends Component {

  constructor(props) {
    super(props);
    this.canvas = createRef();
    this.draw = throttle(this.draw, this.props.msecsPerFps);
  }

  componentDidMount() {
    this.ctx = new Canvas(this.canvas.current);
    this.draw();
  }

  componentDidUpdate() {
    this.draw();
  }

  draw = () => {
    // TODO: only update this if required
    this.ctx.startDrawingFrame();
    this.ctx.save();
    // TODO: only update the scheme when it changed
    this.scheme = schemes.getScheme(this.props.colorScheme);
    this.drawScene();
    this.ctx.restore();
    this.ctx.endDrawingFrame();
  }

  drawScene() {
    this.scene = {};
    ({xPos: this.scene.xViewPos, yPos: this.scene.yViewPos} = this.props.position);
    this.scene.xScalingFactor = 1 / this.props.globalTileWidth * this.props.tileWidth;
    this.scene.yScalingFactor = 1 / this.props.globalTileHeight * this.props.tileHeight;
    this.drawCurrentViewpoint();
    this.drawSequences();
  }

  drawSequences() {
    const {
      xViewPos, xScalingFactor,
    } = this.scene;
    const sequences = this.props.sequences.raw;
    const xInitPos = 0;
    //let yPos = -(yViewPos % tileHeight);
    // TODO: move into the reducer
    //let i = clamp(floor(yViewPos / tileHeight), 0, sequences.length - 1);
    let yPos = 0;
    let i = 0;

    // sequences themselves
    for (; i < sequences.length; i++) {
      const sequence = sequences[i].sequence;
      let xPos = xInitPos;
      let j = clamp(floor(xViewPos * xScalingFactor), 0, sequence.length - 1);
      j = 0;
      for (; j < sequence.length; j++) {
        const el = sequence[j];
        this.ctx.fillStyle(this.scheme.getColor(el));
        this.ctx.globalAlpha(0.5);
        this.ctx.fillRect(xPos, yPos, this.props.tileWidth, this.props.tileHeight);
        xPos += this.props.tileWidth;
        if (xPos > this.props.globalWidth)
            break;
      }
      yPos += this.props.tileHeight;
      if (yPos > this.props.height)
          break;
    }
  }

  drawCurrentViewpoint() {
    // currently selected area
    const {
      xViewPos, xScalingFactor,
      yViewPos, yScalingFactor,
    } = this.scene;
    this.ctx.globalAlpha(0.8);
    this.ctx.fillRect(
      xViewPos * xScalingFactor,
      yViewPos * yScalingFactor,
      this.props.globalWidth  * xScalingFactor,
      this.props.globalHeight * yScalingFactor,
    );
  }

  render() {
    const style = {
      display: "block",
    };
    return (
      <canvas
        ref={this.canvas}
        width={this.props.globalWidth}
        height={this.props.height}
        style={style}
      />
    );
  }
}

SequenceOverviewComponent.defaultProps = {
  height: 50,
  tileWidth: 5,
  tileHeight: 5,
};

SequenceOverviewComponent.PropTypes = {
  /**
   * Height of the SequenceOverview (in pixels), e.g. `50`
   */
  height: PropTypes.number,

  /**
   * Width of a tile in the OverviewBar, e.g. `5`
   */
  tileWidth: PropTypes.number,

  /**
   * Height of a tile in the OverviewBar, e.g. `5`
   */
  tileHeight: PropTypes.number,
};

const mapStateToProps = state => {
  return {
    position: state.position,
    viewpoint: state.viewpoint,
    ui: state.ui,
    sequences: state.sequences,
    globalWidth: state.props.width,
    globalHeight: state.props.height,
    msecsPerFps: state.props.msecsPerFps,
    globalTileWidth: state.props.tileWidth,
    globalTileHeight: state.props.tileHeight,
    colorScheme: state.props.colorScheme,
  }
}

export default msaConnect(
  mapStateToProps,
)(SequenceOverviewComponent);
