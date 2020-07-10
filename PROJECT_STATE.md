# Report of the corrent state of this Fork

- We forked this project from https://github.com/ebi-webcomponents/react-msa-viewer - `02/04/2020`

- Dependencies updates and cleanup done - `03/04/2020`

  - ✅The project uses Rollup to do a build. Only this build related `npm` scripts are working:
    - `npm run build:basic`
    - `npm run watch`
  - ✅Terser works as an output plugin:
    - `npm run build` creates: `index.umd.js`, `index.umd.js.map`, `index.umd.min.js` and `index.esm.min.js`
  - ✅Tests are working:
    - `npm test`
    - `npm run test:watch`
  - ✅Automatic generation of the Documentation:
    - `npm run docs`
  - ✅It also uses storybook to have a dashboard of its capabilities.
    - `npm run storybook`

### State of the Storybook - `03/04/2020`

    * Examples working on storybook:
      * ✅ Basic
      * ❌ Customization: Only colour schemas are reflecting changes
      * ✅ Layouting
      * ✅ Events
      * ❌ Navigation: The navigation buttons aren't working.
      * ✅ Plugins

## Checking the code

The main react component is `<MSAViewer />` which can be used as a `Provider` of the store info for any of its `children` or if it doesn't have any, it will include one of the predifined layouts selecting them via the `<MSALayouer />`.

A Layout comopnent is a simple react component that locates the alignment components on an specifit part of the page. The project has 5 layouts (_basic_ is the default):

- basic
- inverse
- full
- compact
- funky
