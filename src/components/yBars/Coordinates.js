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
      style: containerStyle,
      position,
      coordinateComponent,
      sequences,
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
    const start = Math.round(position.xPos / tileWidth);
    const end = start + Math.round(width / tileWidth) - 1;
    const nSequencesInView = Math.ceil(height / tileHeight);
    const lastSequenceInView = position.currentViewSequence + nSequencesInView;
    const inView = (index) =>
      index >= position.currentViewSequence && index <= lastSequenceInView;
    return (
      <div style={containerStyle}>
        <div style={style} ref={this.el}>
          {sequences.map((sequence, index) => (
            <Coordinate
              key={index}
              index={index}
              start={start + sequence.start}
              end={end + sequence.start}
              tileHeight={tileHeight}
              height={height}
              coordinateComponent={coordinateComponent}
              inView={inView(index)}
            />
          ))}
        </div>
      </div>
    );
  }
}

// Coordinates.defaultProps = {
//   labelStyle: {},
// };

// Coordinates.propTypes = {
//   /**
//    * Font of the sequence labels, e.g. `20px Arial`
//    */
//   font: PropTypes.string,

//   /**
//    * Component to create labels from.
//    */
//   labelComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),

//   /**
//    * Inline styles to apply to the Label component
//    */
//   style: PropTypes.object,

//   /**
//    * Inline styles to apply to each label.
//    */
//   labelStyle: PropTypes.object,

//   /**
//    * Attributes to apply to each label.
//    */
//   labelAttributes: PropTypes.object,
// };

const mapStateToProps = (state) => {
  return {
    width: state.props.width,
    height: state.props.height,
    tileHeight: state.props.tileHeight,
    tileWidth: state.props.tileWidth,
    sequences: state.sequences.raw,
    nrYTiles: state.sequenceStats.nrYTiles,
  };
};

export default msaConnect(mapStateToProps)(
  withPositionStore(Coordinates, { withX: true, withY: true })
);
