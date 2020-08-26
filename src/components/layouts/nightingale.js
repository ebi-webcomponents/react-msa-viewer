import React from "react";
import { isEmpty } from "lodash-es";

import { Labels, SequenceViewer, Coordinates } from "../index";

import PureBaseLayout from "./PureBaseLayout";

class NightingaleLayout extends PureBaseLayout {
  render() {
    const {
      leftCoordinatesProps,
      rightCoordinatesProps,
      labelsProps,
    } = this.props;

    return (
      <div
        style={{
          display: "flex",
        }}
      >
        {!isEmpty(labelsProps) && <Labels {...labelsProps} />}
        {!isEmpty(leftCoordinatesProps) && (
          <Coordinates {...leftCoordinatesProps} />
        )}
        <SequenceViewer {...this.props.sequenceViewerProps} />
        {!isEmpty(rightCoordinatesProps) && (
          <Coordinates {...rightCoordinatesProps} />
        )}
      </div>
    );
  }
}

NightingaleLayout.propTypes = {
  ...PureBaseLayout.propTypes,
};

export default NightingaleLayout;
