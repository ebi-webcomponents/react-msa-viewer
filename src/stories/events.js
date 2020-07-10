/**
 * Copyright 2018, Plotly, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { actions, MSAViewer, SequenceViewer } from "../lib";

const sequences = [
  {
    name: "seq.1",
    sequence: "MEEPQSDPSIEP-PLSQETFSDLWKLLPENNVLSPLPS-QA-VDDLMLSPDDLAQWLTED",
  },
  {
    name: "seq.2",
    sequence: "MEEPQSDLSIEL-PLSQETFSDLWKLLPPNNVLSTLPS-SDSIEE-LFLSENVAGWLEDP",
  },
  {
    name: "seq.3",
    sequence: "MEEPQSDLSIEL-PLSQETFSDLWKLLPPNNVLSTLPS-SDSIEE-LFLSENVAGWLEDP",
  },
];

const highlight = [
  {
    residues: { from: 1, to: 20 },
    sequences: { from: 0, to: 0 },
    id: "id-1",
  },
  {
    residues: { from: 3, to: 10 },
    sequences: { from: 2, to: 2 },
    id: "id-2",
  },
];

// storybook-action-logger doesn't support auto event expansion,
// but most consoles do
const storyAction = (name) => {
  const actionCallback = action(name);
  return (e) => {
    console.log(name, e);
    actionCallback(e);
  };
};

function Tooltip(props) {
  const { direction, style, children, ...otherProps } = props;
  const containerStyle = {
    display: "inline-block",
  };
  const tooltipStyle = {
    position: "relative",
    width: "160px",
  };
  const textStyle = {
    color: "#fff",
    fontSize: "14px",
    lineHeight: 1.2,
    textAlign: "center",
    backgroundColor: "#000",
    borderRadius: "3px",
    padding: "7px",
  };
  const triangleStyle = {
    position: "absolute",
    width: 0,
    fontSize: 0,
    lineHeight: 0,
    visibility: "visible",
    opacity: 1,
  };

  switch (direction) {
    case "up":
    case "down":
      triangleStyle.borderLeft = "5px solid transparent";
      triangleStyle.borderRight = "5px solid transparent";
      triangleStyle.left = "50%";
      triangleStyle.marginLeft = "-5px";
      break;
    case "left":
    case "right":
      triangleStyle.borderTop = "5px solid transparent";
      triangleStyle.borderBottom = "5px solid transparent";
      triangleStyle.top = "50%";
      triangleStyle.marginTop = "-5px";
      break;
    default:
  }

  switch (direction) {
    case "down":
      triangleStyle.borderTop = "5px solid #000";
      triangleStyle.top = "100%";
      containerStyle.paddingBottom = "5px";
      break;
    case "up":
      triangleStyle.borderBottom = "5px solid #000";
      triangleStyle.top = "0%";
      triangleStyle.marginTop = "-5px";
      containerStyle.paddingTop = "5px";
      break;
    case "left":
      triangleStyle.borderRight = "5px solid #000";
      triangleStyle.marginLeft = "-5px";
      containerStyle.paddingLeft = "5px";
      break;
    case "right":
      triangleStyle.left = "100%";
      triangleStyle.borderLeft = "5px solid #000";
      containerStyle.paddingRight = "5px";
      break;
    default:
  }
  return (
    <div style={{ ...containerStyle, ...style }} {...otherProps}>
      <div style={tooltipStyle}>
        <div style={textStyle}>{children}</div>
        <div style={triangleStyle} />
      </div>
    </div>
  );
}
Tooltip.defaultProps = {
  style: {},
  direction: "down",
};

storiesOf("Events", module)
  .add("onResidue", () => (
    <MSAViewer sequences={sequences}>
      Check the console or the "Action Logger" tab for the resulting events.
      <SequenceViewer
        onResidueMouseEnter={storyAction("onResidueMouseEnter")}
        onResidueMouseLeave={storyAction("onResidueMouseLeave")}
        onResidueClick={storyAction("onResidueClick")}
        onResidueDoubleClick={storyAction("onResidueDoubleClick")}
      />
    </MSAViewer>
  ))
  .add("onResidueClick", () => {
    class ExtraInformation extends Component {
      state = {};
      onResidueClick = (e) => {
        this.setState({ lastEvent: e });
      };
      render() {
        return (
          <div>
            Click on a residue:
            <MSAViewer sequences={sequences}>
              <SequenceViewer onResidueClick={this.onResidueClick} />
            </MSAViewer>
            {this.state.lastEvent && (
              <div>
                Selection: {this.state.lastEvent.residue}
                (from {this.state.lastEvent.sequence.name})
              </div>
            )}
          </div>
        );
      }
    }
    return <ExtraInformation />;
  })
  .add("onHighlight", () => (
    <MSAViewer sequences={sequences}>
      Check the console or the "Action Logger" tab for the resulting events.
      <SequenceViewer
        onHighlightClick={storyAction("onHilightClick")}
        onHighlightMouseEnter={storyAction("onHighlightMouseEnter")}
        onHighlightMouseLeave={storyAction("onHighlightMouseLeave")}
        highlight={highlight}
      />
    </MSAViewer>
  ))
  .add("onHighlightClick", () => {
    class ExtraInformation extends Component {
      state = {};
      onHighlightClick = (e) => {
        this.setState({ lastEvent: e });
      };
      render() {
        return (
          <div>
            Click on a residue:
            <MSAViewer sequences={sequences}>
              <SequenceViewer
                onHighlightClick={this.onHighlightClick}
                highlight={highlight}
              />
            </MSAViewer>
            {this.state.lastEvent && (
              <div>Last highlight clicked: {this.state.lastEvent}</div>
            )}
          </div>
        );
      }
    }
    return <ExtraInformation />;
  })
  .add("dispatch", () => {
    class MSADispatch extends Component {
      onSpecificClick = (e) => {
        this.el.updatePosition({ xPos: 100, yPos: 100 });
      };
      onGenericClick = (e) => {
        const action = actions.movePosition({ xMovement: 50 });
        this.el.dispatch(action);
      };
      render() {
        return (
          <div>
            <MSAViewer ref={(ref) => (this.el = ref)} sequences={sequences} />
            <button onClick={this.onSpecificClick}>Specific method</button>
            <button onClick={this.onGenericClick}>Generic dispatch</button>
          </div>
        );
      }
    }
    return <MSADispatch />;
  })
  .add("Required for Nightingale", () => {
    class MSADispatch extends Component {
      state = { tileWidth: 40, width: 700 };
      goToSpecificResidue = (aaPos) => {
        this.el.updatePositionByResidue({ aaPos });
      };
      modifyTileWidth = (increment) => () => {
        // this.el.updateProp({key: 'tileWidth', value: this.state.tileWidth + increment})
        this.setState({ tileWidth: this.state.tileWidth + increment });
      };
      modifyWidth = (increment) => () => {
        this.setState({ width: this.state.width + increment });
      };
      goToRegion = () => {
        const region = {
          start: 10,
          end: 20,
        };
        this.setState(
          { tileWidth: this.state.width / (region.end + 1 - region.start) },
          () => this.goToSpecificResidue(region.start)
        );
      };
      highlightRegion = () => {
        this.el.highlightRegion([
          {
            sequences: {
              from: 1,
              to: 2,
            },
            residues: {
              from: 2,
              to: 13,
            },
          },
        ]);
      };
      removeHighlightRegion = () => {
        const action = actions.removeHighlightRegion();
        this.el.dispatch(action);
      };
      toBeImplemented = () => console.log("Missing method");

      render() {
        return (
          <div>
            <MSAViewer
              ref={(ref) => (this.el = ref)}
              sequences={sequences}
              tileWidth={this.state.tileWidth}
              width={this.state.width}
              layout="compact"
              onPositionUpdate={console.log}
            />
            <button onClick={() => this.goToSpecificResidue(10.5)}>
              GoTo Residue 10.5
            </button>
            <div>
              <b>Tile width</b>
              <button onClick={this.modifyTileWidth(+5)}>+</button>
              <button onClick={this.modifyTileWidth(-5)}>-</button>
            </div>
            <div>
              <b>Width</b>
              <button onClick={this.modifyWidth(+20)}>+</button>
              <button onClick={this.modifyWidth(-20)}>-</button>
            </div>
            <button onClick={this.goToRegion}>
              GoTo Residue Region [10-20]{" "}
            </button>
            <div>
              <button onClick={this.highlightRegion}>
                Highlight Region [2-13]{" "}
              </button>
              <button onClick={this.removeHighlightRegion}>
                Remove Highlight
              </button>
            </div>
            <p>Current position: [x1,x2]</p>
          </div>
        );
      }
    }
    return <MSADispatch />;
  })
  .add("Tooltips (WIP)", () => {
    class SimpleTooltip extends Component {
      state = {};
      onResidueMouseEnter = (e) => {
        let direction, tooltipPosition;
        if (e.position < 10) {
          direction = "left";
          tooltipPosition = {
            top: (e.i - 0.3) * 20 + "px",
            left: (e.position + 1) * 20 + "px",
          };
        } else {
          direction = "right";
          tooltipPosition = {
            top: (e.i - 0.3) * 20 + "px",
            left: e.position * 20 - 165 + "px",
          };
        }
        this.setState({
          lastEvent: e,
          tooltipPosition,
          direction,
        });
      };
      onResidueMouseLeave = (e) => {
        this.setState({ lastEvent: undefined });
      };
      render() {
        return (
          <div>
            <MSAViewer sequences={sequences}>
              <div style={{ position: "relative" }}>
                <SequenceViewer
                  onResidueMouseEnter={this.onResidueMouseEnter}
                  onResidueMouseLeave={this.onResidueMouseLeave}
                />
                {this.state.lastEvent && (
                  <div
                    style={{
                      position: "absolute",
                      opacity: 0.8,
                      ...this.state.tooltipPosition,
                    }}
                  >
                    <Tooltip direction={this.state.direction}>
                      {this.state.lastEvent.residue}
                    </Tooltip>
                  </div>
                )}
              </div>
            </MSAViewer>
          </div>
        );
      }
    }
    return <SimpleTooltip />;
  });
