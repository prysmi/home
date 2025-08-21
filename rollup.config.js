// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/js/animation.js',
  output: {
    file: 'dist/animation.bundle.js',
    format: 'iife', // A self-executing format suitable for browsers
    sourcemap: false
  },
  plugins: [
    nodeResolve(), // Helps Rollup find the 'three' library in your node_modules
    terser()       // Minifies the final bundle
  ]
};
