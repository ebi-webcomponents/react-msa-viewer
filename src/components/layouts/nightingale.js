import React from "react";

import {
  // PositionBar,
  Labels,
  SequenceViewer
} from "../index";

import PureBaseLayout from "./PureBaseLayout";

class NightingaleLayout extends PureBaseLayout {
  render() {
    const { labelsProps } = this.props;
    return (
      <div
        style={{
          display: "flex"
        }}
      >
        {labelsProps &&
          (labelsProps.labelStyle || labelsProps.labelComponent) && (
            <Labels {...labelsProps} />
          )}
        <SequenceViewer {...this.props.sequenceViewerProps} />
      </div>
    );
  }
}

NightingaleLayout.propTypes = {
  ...PureBaseLayout.propTypes
};

export default NightingaleLayout;
