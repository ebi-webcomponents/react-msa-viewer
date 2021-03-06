/**
 * Copyright 2018, Plotly, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from "react";
import { storiesOf } from "@storybook/react";
import { MSAViewer } from "../lib";
import { staticSchemes, dynSchemes } from "../../src/colorschemes";
import {
  select,
  text,
  boolean,
  number,
  withKnobs,
} from "@storybook/addon-knobs";
import { zipObject } from "lodash-es";

const sequences = [
  {
    name: "seq.1",
    sequence: "MEEPQSDPSIEP-PLSQETFSDLWKLLPENNVLSPLPS-QA-VDDLMLSPDDLAQWLTED",
  },
  {
    name: "seq.2",
    sequence: "MEEPQSDLSIEL-PLSQETFTDLWKLLPPNNVLSTLPS-SDSIEE-LFLSENVAGWLEDP",
  },
  {
    name: "seq.3",
    sequence: "MEPIQSDLSIEL-PLSQETFWDLWKLLPPNNVLSTLPS-SDSIEE-LFLSENVAGWLEDP",
  },
  {
    name: "seq.4",
    sequence: "MIPEQSSLSIEL-PLSQETFLDLWKLYPPNNVLSTLPS-SDSIEE-LFLSENVAGWLEDP",
  },
];

// Storybook 4 selects only accepts key/value objects
function createObject(options) {
  return zipObject(options, options);
}

storiesOf("Customization", module)
  .addDecorator(withKnobs)
  .add("Colorschemes", function () {
    // 2018: see https://github.com/wilzbach/msa-colorschemes for now
    // 2020: additional color schemes added for UniProt amino acid properties
    const colorSchemes = [
      ...Object.keys(staticSchemes),
      ...Object.keys(dynSchemes),
    ];
    const options = {
      colorScheme: select("Colorscheme", createObject(colorSchemes), "zappo"),
      calculateConservation: true,
      overlayConservation: boolean("overlayConservation", false),
      sampleSizeConservation: number("sampleSizeConservation", ""),
      sequenceTextFont: "16px Monospace",
      sequences,
    };
    let currentColor = null;
    class MSAConservation extends Component {
      componentDidMount() {
        this.parentDiv.addEventListener("conservationProgress", console.log);
        this.parentDiv.addEventListener("drawCompleted", () => {
          const { name, map } = this.viewer.getColorMap();
          if (name !== currentColor) {
            console.log(name, map);
            currentColor = name;
          }
        });
      }
      render() {
        return (
          <div ref={(ref) => (this.parentDiv = ref)}>
            <MSAViewer {...options} ref={(ref) => (this.viewer = ref)} />
          </div>
        );
      }
    }
    return <MSAConservation />;
  })
  .add("Custom ColorScheme", function () {
    // see https://github.com/wilzbach/msa-colorschemes for now
    const myColorMap = {
      M: "blue",
      E: "red",
      T: "green",
    };
    class MyColorScheme {
      getColor(element) {
        return element in myColorMap ? myColorMap[element] : "grey";
      }
    }
    const myColorScheme = new MyColorScheme();
    const options = {
      colorScheme: myColorScheme,
      sequences,
    };
    return <MSAViewer {...options} />;
  })
  .add("Custom Labels", function () {
    const fontSizes = [
      "6px",
      "8px",
      "10px",
      "12px",
      "14px",
      "16px",
      "18px",
      "20px",
    ];
    const fontSize = select("Font size", createObject(fontSizes), "14px");
    const options = {
      sequences,
      labelComponent: ({ sequence }) => {
        return (
          <div style={{ height: 20, fontWeight: "bold", fontSize }}>
            My: {sequence.name}
          </div>
        );
      },
    };
    return <MSAViewer {...options} />;
  })
  .add("Custom Markers", function () {
    const fontSizes = ["6px", "8px", "10px", "12px", "14px", "16px", "18px"];
    const fontSize = select("Font size", createObject(fontSizes), "10px");
    const options = {
      sequences,
      markerComponent: ({ index }) => {
        return (
          <div
            style={{
              width: 20,
              display: "inline-block",
              textAlign: "center",
              fontSize: fontSize,
              fontWeight: "bold",
              color: "pink",
            }}
          >
            {index}
          </div>
        );
      },
    };
    return <MSAViewer {...options} />;
  })
  .add("Custom styling", function () {
    const options = {
      sequences,
      labelStyle: {
        outline: text("Label style (outline)", "1px solid black"),
      },
      markerStyle: {
        outline: text("Marker style (outline)", "1px solid black"),
      },
      sequenceTextColor: text("Sequence color", "blue"),
    };
    return <MSAViewer {...options} />;
  })
  .add("Custom scollbars", function () {
    const options = {
      sequences,
      sequenceScrollBarPositionX: select(
        "ScrollBarPositionX",
        createObject(["top", "bottom"]),
        "top"
      ),
      sequenceScrollBarPositionY: select(
        "ScrollBarPositionY",
        createObject(["left", "right"]),
        "left"
      ),
      sequenceOverflow: select(
        "Overflow",
        createObject(["scroll", "auto", "hidden"]),
        "scroll"
      ),
    };
    return <MSAViewer {...options} />;
  });
