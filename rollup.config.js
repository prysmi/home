// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/js/animation.js', // This is your main script
    output: {
      file: 'dist/animation.bundle.js',
      format: 'iife',
      sourcemap: false,
    },
    plugins: [
      nodeResolve(),
      terser()
    ]
  },
  {
    input: 'src/js/animation.worker.js', // This is the new worker script
    output: {
      file: 'dist/animation.worker.bundle.js',
      format: 'iife', // Use 'iife' or 'esm' depending on worker type
      sourcemap: false,
    },
    plugins: [
      nodeResolve(),
      terser()
    ]
  }
];
