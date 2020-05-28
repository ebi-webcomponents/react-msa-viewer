import React from 'react';

import {
  // PositionBar,
  Labels,
  SequenceViewer,
} from '../index';

import PureBaseLayout from './PureBaseLayout';

class NightingaleLayout extends PureBaseLayout {
  render() {
    return (
      <div style={{
        display: "flex",
      }}>
        {this.props.labelsProps && this.props.labelsProps.labelStyle &&
        <Labels
            {...this.props.labelsProps}
        />
        }
        <SequenceViewer {...this.props.sequenceViewerProps} />
      </div>
    );
  }
}

NightingaleLayout.propTypes = {
  ...PureBaseLayout.propTypes,
};

export default NightingaleLayout;
