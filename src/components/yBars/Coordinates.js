import React, { PureComponent, memo } from "react";
import PropTypes from "prop-types";

import msaConnect from "../../store/connect";
import withPositionStore from "../../store/withPositionStore";

const Coordinate = memo(
  ({ coordinateComponent, ...otherProps }) => {
    if (coordinateComponent) {
      const CoordinateComponent = coordinateComponent;
      return <CoordinateComponent {...otherProps} />;
    } else {
      const { start, end, tileHeight } = otherProps;
      return (
        <div style={{ height: tileHeight }}>
          {start}-{end}
        </div>
      );
    }
  },
  (_, { inView }) => !inView
);

/**
 * Displays the coordinates of the current scrolled position.
 */
export class Coordinates extends PureComponent {
  constructor(props) {
    super(props);
    this.el = React.createRef();
  }

  shouldRerender() {
    // Need this so that withPositionStore will provide new position information.
    // See withPositionStore docstring for further information.
    return true;
  }

  render() {
    const {
      height,
      width,
      tileHeight,
      tileWidth,
      position,
      coordinateComponent,
      sequences,
      coordinateStyle,
    } = this.props;
    const style = {
      height,
      overflow: "hidden",
      position: "relative",
      whiteSpace: "nowrap",
    };

    // These assignments to props are neccessary so that withPositionStore will sync up scrolling
    this.props.position.lastCurrentViewSequence = position.currentViewSequence;
    this.props.position.lastStartYTile = 0;

    // Start and end coordinates of the current scrolled view
    // Calculating this rather than using currentViewSequencePosition as
    // we want to the start/end to increment by one when the scroll is past
    // half a tileWidth (which Math.round gives us)
    // Use 1-based indexing as this how much sequences are indexed
    const start = Math.round(position.xPos / tileWidth) + 1;
    const end = start + Math.round(width / tileWidth) - 2;

    // Use this to memo so off-view coordinates aren't re-rendered
    const nSequencesInView = Math.ceil(height / tileHeight);
    const lastSequenceInView = position.currentViewSequence + nSequencesInView;
    const inView = (index) =>
      index >= position.currentViewSequence && index <= lastSequenceInView;

    return (
      <div>
        <div style={style} ref={this.el}>
          {sequences.map((sequence, index) => (
            <Coordinate
              key={index}
              start={start}
              end={end}
              tileHeight={tileHeight}
              coordinateComponent={coordinateComponent}
              style={coordinateStyle}
              inView={inView(index)}
              sequence={sequence}
            />
          ))}
        </div>
      </div>
    );
  }
}

Coordinates.propTypes = {
  /**
   * Width of the sequence viewer (in pixels), e.g. `500`.
   */
  width: PropTypes.number.isRequired,

  /**
   * Height of the sequence viewer (in pixels), e.g. `500`.
   */
  height: PropTypes.number.isRequired,

  /**
   * Width of the main tiles (in pixels), e.g. `20`
   */
  tileWidth: PropTypes.number.isRequired,

  /**
   * Height of the main tiles (in pixels), e.g. `20`
   */
  tileHeight: PropTypes.number.isRequired,

  position: PropTypes.shape({
    currentViewSequence: PropTypes.number.isRequired,
    currentViewSequencePosition: PropTypes.number.isRequired,
    lastCurrentViewSequence: PropTypes.number,
    lastStartYTile: PropTypes.number,
    xPos: PropTypes.number.isRequired,
    xPosOffset: PropTypes.number.isRequired,
    yPos: PropTypes.number.isRequired,
    yPosOffset: PropTypes.number.isRequired,
  }).isRequired,

  /**
   * Component to create labels from.
   */
  coordinateComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),

  /**
   * Inline styles to apply to each label.
   */
  coordinateStyle: PropTypes.object,

  /**
   * Attributes to apply to each label.
   */
  coordinateAttributes: PropTypes.object,
};

Coordinates.defaultProps = {
  coordinateComponent: undefined,
  coordinateStyle: {},
  coordinateAttributes: {},
};

const mapStateToProps = (state) => {
  return {
    width: state.props.width,
    height: state.props.height,
    tileHeight: state.props.tileHeight,
    tileWidth: state.props.tileWidth,
    sequences: state.sequences.raw,
  };
};

export default msaConnect(mapStateToProps)(
  withPositionStore(Coordinates, { withX: true, withY: true })
);
