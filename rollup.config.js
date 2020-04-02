import babel from 'rollup-plugin-babel';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import commonjs from '@rollup/plugin-commonjs';
import visualizer from 'rollup-plugin-visualizer';

import { version } from "./package.json";

export default {
  input: 'src/lib.js',
  output: {
    sourcemap: true,
    name: "ReactMSAViewer",
    file: "dist/index.umd.js",
    format: "umd",
    exports: "named", // or: 'default', 'named', 'none'
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      'prop-types': 'PropTypes',
    }
  },
  external: [
    'react',
    'react-dom',
    'prop-types',
  ],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'MSA_DEVELOPMENT_VERSION': version,
      "require('assert')": "{}",
      delimiters: ['', '']
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    strip({
      debugger: true,
      functions: [ 'console.log', 'assert', 'assert.*', 'debug', 'alert' ],
      sourceMap: true,
    }),
    resolve({
      browser: true,
    }),
    commonjs({
      namedExports: {
        'react-is': ['isValidElementType', 'isContextConsumer'],
        'react-is': ['isValidElementType', 'isContextConsumer'],
      },
    }),
    /**
     * the terser plugin breaks the sourcemap
    /* same for the rollup-plugin-{minify,uglify}
    /* hence we call terser manually
    */
    //terser({
      //sourcemap: true,
    //}),
    visualizer({
      filename: './dist/statistics.html',
      title: 'MSAViewer Bundle',
      //sourcemap: true,
    }),
  ],
};
