/**
 * Copyright 2018, Plotly, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A special Redux store that DOES NOT trigger automatically React Tree calculations.
 * This is only used to dispatch very frequent events like `POSITION_{MOVE,UPDATE}`.
 */

import { createStore } from "redux";

import { createAction } from "./actions";

import { clamp, floor, pick } from "lodash-es";

import assert from "../assert";

// send when the main store changes
export const updateMainStore = createAction("MAINSTORE_UPDATE");
// move the position relatively by {xMovement, yMovement}
export const movePosition = createAction("POSITION_MOVE");
// set an absolute position with {yPos, xPos}
export const updatePosition = createAction("POSITION_UPDATE");
// set the xPos based on a residue's poition {aaPos}
export const updatePositionByResidue = createAction(
  "POSITION_BY_RESIDUE_UPDATE"
);
// send when an area needs to be highlighted in the graphic
export const highlightRegion = createAction("HIGHLIGHT_REGION");
export const removeHighlightRegion = createAction("REMOVE_HIGHLIGHT_REGION");

export const actions = {
  updateMainStore,
  updatePosition,
  movePosition,
  updatePositionByResidue,
  highlightRegion,
  removeHighlightRegion,
};

/**
 * Makes sure that the position isn't set isn't out of its boundaries.
 */
function commonPositionReducer(prevState, pos) {
  const maximum = prevState.sequences.maxLength;
  const maxWidth = maximum * prevState.props.tileWidth - prevState.props.width;
  pos.xPos = clamp(pos.xPos, 0, maxWidth);
  const maxHeight =
    prevState.sequences.raw.length * prevState.props.tileHeight -
    prevState.props.height;
  pos.yPos = clamp(pos.yPos, 0, maxHeight);
  return {
    ...prevState,
    position: pos,
  };
}

/**
 * Reducer for the {move,update}Position events
 */
const relativePositionReducer = (
  prevState = { position: { xPos: 0, yPos: 0 } },
  action
) => {
  const pos = prevState.position;
  switch (action.type) {
    case movePosition.key:
      assert(
        action.payload.xMovement !== undefined ||
          action.payload.yMovement !== undefined,
        "must contain at least xMovement or yMovement"
      );
      // be sure to copy the previous state
      const movePayload = { ...pos };
      movePayload.xPos += action.payload.xMovement || 0;
      movePayload.yPos += action.payload.yMovement || 0;
      return commonPositionReducer(prevState, movePayload);
    case updatePosition.key:
      assert(
        action.payload.xPos !== undefined || action.payload.yPos !== undefined,
        "must contain at least xPos or yPos"
      );
      const updatePayload = {
        xPos: isNaN(action.payload.xPos) ? pos.xPos : action.payload.xPos,
        yPos: isNaN(action.payload.yPos) ? pos.yPos : action.payload.yPos
      };
      return commonPositionReducer(prevState, updatePayload);
    case updatePositionByResidue.key:
      assert(action.payload.aaPos !== undefined, "must contain at least aaPos");

      const updateResidue = {
        xPos: prevState.props.tileWidth * (action.payload.aaPos - 1),
        yPos: pos.yPos,
      };
      return commonPositionReducer(prevState, updateResidue);
    default:
      return prevState;
  }
};

/**
 * The main position store reducer which adds "position" to
 * the reduced main store.
 */
export function positionReducer(
  oldState = {
    position: { xPos: 0, yPos: 0 },
    highlight: null,
  },
  action
) {
  let state = oldState;
  let position = oldState.position;
  let highlight = oldState.highlight;
  switch (action.type) {
    case updateMainStore.key:
      // merge updates of the main store with this store for now
      state = {
        ...pick(state, ["props", "sequenceStats", "sequences"]),
        ...action.payload,
      };
      break;
    case updatePosition.key:
    case movePosition.key:
    case updatePositionByResidue.key:
      position = relativePositionReducer(state, action).position;
      break;
    case highlightRegion.key:
      highlight = action.payload;
      break;
    case removeHighlightRegion.key:
      highlight = null;
      break;
    default:
      return state;
  }
  const addedState = {
    xPosOffset: -(position.xPos % state.props.tileWidth),
    yPosOffset: -(position.yPos % state.props.tileWidth),
    currentViewSequence: clamp(
      floor(position.yPos / state.props.tileHeight),
      0,
      state.sequences.length - 1
    ),
    currentViewSequencePosition: clamp(
      floor(position.xPos / state.props.tileWidth),
      0,
      state.sequences.maxLength
    ),
    position,
  };
  return {
    ...state,
    ...addedState,
    highlight,
  };
}

// for future flexibility
export { createStore as createPositionStore };
