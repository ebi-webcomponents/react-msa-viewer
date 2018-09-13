import React, { Component } from 'react';

import shallowEqual from 'shallowequal';

import createMSAStore from './createMSAStore';
import * as actions from './actions';

export const propsToRedux = (WrappedComponent) => {
  return class PropsToReduxComponent extends Component {

    constructor(props) {
      super(props);
      this.store = props.store || createMSAStore(props);
    }

    // TODO: this method will be deprecated with React 17
    componentWillReceiveProps(nextProps) {
      console.log("nextProps", nextProps);
      // TODO: store might change
      const state = this.store.getState();
      for (const prop in nextProps) {
        if (prop === 'store') {
          continue; // we only want to check real props
        }
        // TODO: improve check on whether the properties got updated
        if (!shallowEqual(state[prop], nextProps[prop])) {
          let action;
          switch (prop) {
            case 'sequences':
              action = actions.updateSequences(nextProps[prop]);
              break;
            case 'ui':
              action = actions.updateUI(nextProps[prop]);
              break;
            case 'viewpoint':
              action = actions.updateViewpoint(nextProps[prop]);
              break;
            default:
              console.error(prop, " is unknown.");
          }
          if (action !== undefined) {
            this.store.dispatch(action);
          }
        }
      }
    }

    render() {
      return (
        <WrappedComponent store={this.store} />
      );
    }
  }
}

export default propsToRedux;
