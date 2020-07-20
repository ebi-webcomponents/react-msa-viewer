/**
 * Copyright 2018, Plotly, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import msaConnect from "./store/connect";
import createMSAStore from "./store/createMSAStore";
// import MSAProvider from './store/provider';
import { Provider as MSAProvider } from "react-redux";
import withPositionStore from "./store/withPositionStore";
import { actions as positionStoreActions } from "./store/positionReducers";
import calculateConservation from "./workers/conservation.worker";

import MSAViewer from "./components/MSAViewer";

import ColorScheme from "./utils/ColorScheme";
import autobind from "./utils/autobind";
import shallowSelect from "./utils/shallowSelect";
import shallowEqual from "./utils/shallowEqual";

import mainStoreActions from "./store/actions";

const VERSION = "MSA_DEVELOPMENT_VERSION";
const actions = { ...mainStoreActions, ...positionStoreActions };

export * from "./components";
export {
  autobind,
  actions,
  ColorScheme,
  createMSAStore,
  msaConnect,
  MSAProvider,
  MSAViewer,
  shallowSelect,
  shallowEqual,
  withPositionStore,
  calculateConservation,
  VERSION as version,
};

export default MSAViewer;
