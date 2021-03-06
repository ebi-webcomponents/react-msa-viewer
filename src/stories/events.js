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

const features = [
  {
    residues: { from: 2, to: 15 },
    sequences: { from: 0, to: 1 },
    id: "id-1",
    borderColor: "blue",
    fillColor: "black",
  },
  {
    residues: { from: 25, to: 50 },
    sequences: { from: 2, to: 2 },
    id: "id-2",
    borderColor: "black",
    mouseOverBorderColor: "green",
    fillColor: "transparent",
    mouseOverFillColor: "transparent",
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
  .add("onFeatureClick", () => {
    class ExtraInformation extends Component {
      state = {};
      onFeatureClick = (e) => {
        this.setState({ lastEvent: e.id });
      };
      render() {
        return (
          <div>
            Click on a feature:
            <MSAViewer sequences={sequences}>
              <SequenceViewer
                onFeatureClick={this.onFeatureClick}
                features={features}
              />
            </MSAViewer>
            {this.state.lastEvent && (
              <div>Last feature clicked: {this.state.lastEvent}</div>
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
      state = { tileWidth: 40, width: 700, aaPos: 1, highlight: null };
      goToSpecificResidue = (aaPos) => {
        this.setState({ aaPos });
        // this.el.updatePositionByResidue({ aaPos });
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
        this.setState({
          tileWidth: this.state.width / (region.end + 1 - region.start),
          aaPos: region.start,
        });
      };
      highlightRegion = (n) => {
        const highlight = {
          sequences: {
            from: 0,
            to: 2,
          },
          residues: {
            from: 2,
            to: 13,
          },
        };

        if (n === 1) this.setState({ highlight });
        else
          this.setState({
            highlight: [
              highlight,
              {
                ...highlight,
                residues: {
                  from: 20,
                  to: 25,
                },
              },
            ],
          });
      };
      removeHighlightRegion = () => {
        this.setState({ highlight: null });
      };
      toBeImplemented = () => console.log("Missing method");

      render() {
        const xPos = this.state.tileWidth * (this.state.aaPos - 1);
        return (
          <div>
            <MSAViewer
              ref={(ref) => (this.el = ref)}
              sequences={sequences}
              tileWidth={this.state.tileWidth}
              width={this.state.width}
              layout="compact"
              position={{ xPos }}
              highlight={this.state.highlight}
            />
            <div>
              <button onClick={() => this.goToSpecificResidue(10.5)}>
                GoTo Residue 10.5
              </button>
              <input
                type="range"
                min="1"
                max="40"
                value={this.state.aaPos}
                onChange={(evt) => this.setState({ aaPos: evt.target.value })}
              />
              <code>
                {this.state.aaPos} = {xPos}px
              </code>
            </div>
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
              <button onClick={() => this.highlightRegion(1)}>
                Highlight Region [2-13]{" "}
              </button>
              <button onClick={() => this.highlightRegion(2)}>
                Highlight Region [2-13] [20-25]{" "}
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
