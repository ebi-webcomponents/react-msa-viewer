/**
* Copyright 2018, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import SequenceViewer from './SequenceViewer';
import { SequenceViewer as CanvasSequenceViewer } from './SequenceViewer';
import MSAViewer from '../MSAViewer';
import {
  dummySequences,
  FakePositionStore,
} from '../../test';

import { mount, shallow } from 'enzyme';

it('renders without crashing', () => {
  const wrapper = mount(<MSAViewer sequences={[...dummySequences]}>
    <SequenceViewer />
  </MSAViewer>);
  expect(wrapper).toMatchSnapshot();
});

describe('sends movement actions on mousemove events', () => {
  let msa;
  beforeEach(() =>
    msa = mount(<FakePositionStore sequences={[...dummySequences]}
      width={400} height={200}
      >
      <SequenceViewer />
    </FakePositionStore>)
  );
  it('should have correctly rendered the canvas', () => {
    const el = msa.find('canvas').first();
    const props = el.props();
    expect(props.width).toBe(400);
    expect(props.height).toBe(140); // only 7 dummy sequences
  });

  it('should have correctly rendered the parent div', () => {
    const el = msa.find('canvas').first();
    const props = el.parent().props();
    expect(props.width).toBe(400);
    expect(props.height).toBe(140); // only 7 dummy sequences
  });

  it("should change the cursor state on mousedown/mouseup", () => {
    expect(msa).toMatchSnapshot();
    const sv = msa.find(CanvasSequenceViewer);
    expect(sv.state().mouse.cursorState).toBe('grab');
    sv.instance().onMouseDown({});
    expect(sv.state().mouse.cursorState).toBe('grabbing');
    sv.instance().onMouseUp({});
    expect(sv.state().mouse.cursorState).toBe('grab');
  })

  it("should send store updates on mousemove between mousedown/mouseup", () => {
    const sv = msa.find(CanvasSequenceViewer).instance();
    const ps = msa.instance().positionStore;
    sv.onMouseMove({pageX: 20, pageY: 10});
    // shouldn't send updates here
    expect(ps.actions).toEqual([]);

    sv.onMouseDown({
      pageX: 20,
      pageY: 10,
    });
    expect(ps.actions).toEqual([]);

    sv.onMouseMove({
      pageX: 40,
      pageY: 20,
    });
    // should send updates here, but we need to wait for requestAnimationFrame
    jest.runAllTimers();
    const expected = [{"payload": {"xMovement": -20, "yMovement": -10}, "type": "POSITION_MOVE"}];
    expect(ps.actions).toEqual(expected);

    sv.onMouseUp({});
    // shouldn't send updates here
    expect(ps.actions).toEqual(expected);
  })

  it("should only rerender on mousemove actions when necessary", () => {
    const sv = msa.find(CanvasSequenceViewer).instance();
    const ps = msa.instance().positionStore;
    const oldDraw = sv.draw();
    sv.draw = jest.fn();
    // restore old state;
    afterAll(() => {
      sv.draw = oldDraw;
    });

    sv.onMouseMove({pageX: 20, pageY: 10});
    // shouldn't trigger a redraw
    expect(sv.draw.mock.calls.length).toBe(0);

    sv.onMouseDown({
      pageX: 20,
      pageY: 10,
    });
    expect(sv.draw.mock.calls.length).toBe(0);

    sv.onMouseMove({
      pageX: 40,
      pageY: 20,
    });
    // should send updates here, but we need to wait for requestAnimationFrame
    jest.runAllTimers();
    expect(sv.draw.mock.calls.length).toBe(1);

    sv.onMouseUp({});
    // shouldn't send updates here
    expect(sv.draw.mock.calls.length).toBe(1);

    // no redraws on mouse{Enter,Leave}
    sv.onMouseEnter({});
    expect(sv.draw.mock.calls.length).toBe(1);

    sv.onMouseEnter({});
    expect(sv.draw.mock.calls.length).toBe(1);
  })
})

it("should fire an event on mouseclick", () => {
  const mockOnClick = jest.fn();
  const msa = mount(<MSAViewer
    sequences={[...dummySequences]}
    width={400} height={200}
    >
    <SequenceViewer onResidueClick={mockOnClick} />
  </MSAViewer>);
  expect(msa).toMatchSnapshot();
  const sv = msa.find(CanvasSequenceViewer).instance();
  const fakeClickEvent = {
    offsetX: 50,
    offsetY: 20,
  };
  sv.onClick(fakeClickEvent);
  expect(mockOnClick.mock.calls.length).toBe(1);
  expect(mockOnClick.mock.calls[0][0]).toEqual({
    "i": 1, "position": 2, "residue": "E",
    "sequence": {
      "name": "sequence 2",
      "sequence": "MEEPQSDLSIEL-PLSQETFSDLWKLLPPNNVLSTLPS-SDSIEE-LFLSENVAGWLEDP"
    }
  });
})

