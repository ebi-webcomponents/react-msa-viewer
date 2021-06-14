/**
 * Copyright 2018, Plotly, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * This wrapper listens to prop changes and forwards these to their
 * appropriate redux store actions.
 */

import React, { Component } from "react";

import { forOwn, isEqual, pick, reduce, omit } from "lodash-es";

import createMSAStore from "./createMSAStore";
import { MSAPropTypes } from "../PropTypes";
import mainStoreActions from "./actions";
import { actions as positionStoreActions } from "./positionReducers";
import requestAnimation from "../utils/requestAnimation";

import ConservationWorker from "../workers/conservation.worker.js";

let worker = null;

const setUpWorker = (store, sequences, sampleSize = null, element) => {
  // sending seqs to worker
  worker = new ConservationWorker();
  console.time("full analysis");
  worker.postMessage({ sequences, sampleSize });
  worker.onmessage = (e) => {
    // Cheaper action, but multiple times => does it cause re-renders?
    store.dispatch(mainStoreActions.updateConservation(e.data));
    if (
      element &&
      element.current &&
      element.current.el &&
      element.current.el.current
    ) {
      element.current.el.current.dispatchEvent(
        new CustomEvent("conservationProgress", {
          bubbles: true,
          detail: e.data,
        })
      );
    }
    if (e.data.progress === 1) {
      console.time("update sequences");
      // Most expensive action, but once
      store.dispatch(mainStoreActions.updateSequences(sequences));
      console.timeEnd("update sequences");
      console.timeEnd("full analysis");
    }
  };
};

/// Maps property changes to redux actions
const reduxActions = {
  sequences: "updateSequences",
};

Object.keys(MSAPropTypes).forEach((key) => {
  if (!(key in reduxActions) && MSAPropTypes[key]) {
    reduxActions[key] = "updateProp";
  }
});

const attributesToStore = Object.keys(reduxActions);

// precompute [action.key]: action for performance
const mapToActionKeys = (obj) =>
  reduce(
    obj,
    (acc, v) => {
      acc[v.key] = v;
      return acc;
    },
    {}
  );
const mainStoreActionKeys = mapToActionKeys(mainStoreActions);
const positionStoreActionKeys = mapToActionKeys(positionStoreActions);

export const PropsToRedux = (WrappedComponent) => {
  class PropsToReduxComponent extends Component {
    constructor(props) {
      super(props);
      const storeProps = pick(props, attributesToStore) || {};
      this.el = React.createRef();
      this.msaStore = props.msaStore;
      if (storeProps.sequences !== undefined) {
        this.msaStore = createMSAStore(storeProps);
        if (storeProps.calculateConservation && this.msaStore) {
          setUpWorker(
            this.msaStore,
            storeProps.sequences,
            storeProps.sampleSizeConservation,
            this.el
          );
        }
      } else {
        console.warn("Check your MSA properties", storeProps);
      }
    }

    componentDidMount() {
      if (this.props.position !== undefined) {
        this.updatePosition(this.props.position);
      }
    }

    // Notify the internal Redux store about property updates
    componentDidUpdate(oldProps) {
      const newProps = this.props;
      // TODO: support batch updates
      for (const prop in pick(newProps, attributesToStore)) {
        if (!isEqual(oldProps[prop], newProps[prop])) {
          if (prop === "position") {
            this.updatePosition(newProps[prop]);
          } else if (prop in reduxActions) {
            let action;
            if (prop === "calculateConservation") {
              if (newProps[prop]) {
                setUpWorker(
                  this.msaStore,
                  this.props.sequences,
                  this.props.sampleSizeConservation,
                  this.el
                );
              } else {
                worker.terminate();
              }
            }
            if (prop === "sampleSizeConservation") {
              if (worker) worker.terminate();
              setUpWorker(
                this.msaStore,
                this.props.sequences,
                this.props.sampleSizeConservation,
                this.el
              );
            }
            switch (reduxActions[prop]) {
              case "updateProp":
                action = mainStoreActions[reduxActions[prop]](
                  prop,
                  newProps[prop]
                );
                break;
              default:
                action = mainStoreActions[reduxActions[prop]](newProps[prop]);
            }
            //console.log("Prop -> Redux: ", action, newProps[prop]);
            this.msaStore.dispatch(action);
          } else {
            console.error(prop, " is unknown.");
          }
        }
      }
    }

    /**
     * Dispatch actions into the MSAViewer component.
     *
     * @param {Object} Action to be be dispatched. Must contain "type" and "payload"
     */
    dispatch(action) {
      if (action.type in mainStoreActionKeys) {
        this.msaStore.dispatch(action);
      } else if (action.type in positionStoreActionKeys) {
        this.el.current.positionStore.dispatch(action);
      } else {
        throw new Error("Invalid action", action);
      }
    }
    getColorMap() {
      const { colorScheme } = this.props;
      let map = {};
      try {
        map = this.msaStore.getState().props.colorScheme.scheme.map;
      } catch {}
      return {
        name: colorScheme,
        map,
      };
    }

    render() {
      const { msaStore, ...props } = omit(this.props, attributesToStore);
      if (this.msaStore === undefined) {
        return <div> Error initializing the MSAViewer. </div>;
      } else {
        return (
          <WrappedComponent
            ref={this.el}
            msaStore={msaStore || this.msaStore}
            {...props}
          />
        );
      }
    }
  }
  // add action from the main store directly to the main MSA instance
  forOwn(mainStoreActions, (v, k) => {
    PropsToReduxComponent.prototype[k] = function (payload) {
      this.msaStore.dispatch(v(payload));
    };
  });
  // add action from the position store directly to the main MSA instance
  forOwn(positionStoreActions, (v, k) => {
    PropsToReduxComponent.prototype[k] = function (payload) {
      requestAnimation(this, () => {
        this.el.current.positionStore.dispatch(v(payload));
      });
    };
  });
  return PropsToReduxComponent;
};

export default PropsToRedux;
