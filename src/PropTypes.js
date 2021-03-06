/**
 * Copyright 2018, Plotly, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from "prop-types";

import { ColorScheme, isColorScheme } from "./utils/ColorScheme";

/**
 * Definition of a single sequence object.
 *   name: label or id of the sequence (doesn't need to be unique)
 *   sequence: raw sequence data (e.g. AGAAAA)
 */
export const SequencePropType = PropTypes.shape({
  name: PropTypes.string,
  sequence: PropTypes.string
});

export const AllowedColorschemes = [
  "aliphatic",
  "aromatic",
  "charged",
  "negative",
  "polar",
  "positive",
  "serine_threonine",
  "buried_index",
  "clustal",
  "clustal2",
  "cinema",
  "helix_propensity",
  "hydro",
  "lesk",
  "mae",
  "nucleotide",
  "purine_pyrimidine",
  "strand_propensity",
  "taylor",
  "turn_propensity",
  "zappo",
  "conservation"
];

export const ColorSchemePropType = PropTypes.oneOfType([
  PropTypes.oneOf(AllowedColorschemes),
  PropTypes.instanceOf(ColorScheme),
  function isColorSchemeObject(props, propName, componentName) {
    if (isColorScheme(props[propName])) {
      // is a child of ColorScheme
    } else {
      return new Error(
        "Invalid prop `" +
          propName +
          "` supplied to" +
          " `" +
          componentName +
          "`. Validation failed."
      );
    }
  }
]);

export const PositionPropType = PropTypes.shape({
  xPos: PropTypes.number,
  yPos: PropTypes.number
});

/**
 * These are the "globally" exposes properties which get inserted into the
 * Redux store.
 */
export const MSAPropTypes = {
  /**
   * Width of the sequence viewer (in pixels), e.g. `500`.
   */
  width: PropTypes.number,

  /**
   * Height of the sequence viewer (in pixels), e.g. `500`.
   */
  height: PropTypes.number,

  /**
   * Width of the main tiles (in pixels), e.g. `20`
   */
  tileWidth: PropTypes.number,

  /**
   * Height of the main tiles (in pixels), e.g. `20`
   */
  tileHeight: PropTypes.number,
  /**
   * Current x and y position of the viewpoint
   * in the main sequence viewer (in pixels).
   * This specifies the position of the top-left corner
   * of the viewpoint within the entire alignment,
   * e.g. `{xPos: 20, yPos: 5}`.
   */
  position: PositionPropType,

  /**
   * Displays a highlight
   */
  highlight: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Colorscheme to use. Currently the follow colorschemes are supported:
   * `aliphatic`, `aromatic`, `buried`, `buried_index`, `charged`, `cinema`, `clustal2`,
   * `clustal`, `helix`, `helix_propensity`, `hydro`, `lesk`, `mae`, `negative`,
   * `nucleotide`, `polar`, `positive`, `purine`, `purine_pyrimidine`, `serine_threonine`,
   * `strand`, `strand_propensity`, `taylor`, `turn`, `turn_propensity`, `zappo`, `conservation`
   *
   * See [msa-colorschemes](https://github.com/wilzbach/msa-colorschemes) for details.
   */
  colorScheme: ColorSchemePropType,

  /**
   * The conservation analisys required to  uce the colorscheme 'conservation' runs on a web worker.
   * By default it is disabled. but it can be enable by setting this prop to `true`
   */
  calculateConservation: PropTypes.bool,

  /**
   * The conservation data can be used to define an overlay that
   * defines the opacity of the background color of each residue.
   */
  overlayConservation: PropTypes.bool,

  /**
   * Number of sequences to use when calculating the conservation. Which is useful to get results for alignments of many sequences.
   * If not included, or not a vlid numeric value, the whole alignemnt will be use for the calculation.
   */
  sampleSizeConservation: PropTypes.number
};

// TODO: separate individual properties into their components
export const msaDefaultProps = {
  width: 800,
  height: 600,
  tileWidth: 20,
  tileHeight: 20,
  colorScheme: "clustal",
  calculateConservation: false,
  overlayConservation: false,
  sampleSizeConservation: undefined
};
