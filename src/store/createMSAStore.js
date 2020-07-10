/**
 * Copyright 2018, Plotly, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from "prop-types";

import { createStore } from "redux";

import { merge } from "lodash-es";

import { MSAPropTypes, msaDefaultProps } from "../PropTypes";

import positionReducers from "../store/reducers";
import {
  updateProps,
  updateSequences,
  updateConservation
} from "../store/actions";

import debug from "../debug";

import ConservationWorker from "../workers/conservation.worker.js";
const worker = new ConservationWorker();

/**
Initializes a new MSAViewer store-like structure.
For performance reasons, the frequently changing position information
has its own redux store.
The default properties from MSAViewer.defaultProps are used.
*/
export const createMSAStore = props => {
  PropTypes.checkPropTypes(MSAPropTypes, props, "prop", "MSAViewer");
  const propsWithDefaultValues = merge({}, msaDefaultProps, props);
  const { sequences, position, ...otherProps } = propsWithDefaultValues;
  const store = createStore(
    positionReducers,
    // https://github.com/zalmoxisus/redux-devtools-extension
    debug &&
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
      window.__REDUX_DEVTOOLS_EXTENSION__()
  );
  store.dispatch(updateProps(otherProps));
  store.dispatch(updateSequences(sequences));
  // sending seqs to worker
  worker.postMessage(sequences);
  worker.onmessage = function(e) {
    store.dispatch(updateConservation(e.data));
    if (e.data.progress === 1) {
      console.log("completed conservation analisys");
      store.dispatch(updateSequences(sequences));
    }
  };

  return store;
};

export default createMSAStore;
