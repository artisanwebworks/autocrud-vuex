
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

export default {
    external: ['axios', 'lodash'],

    input: 'src/index.js',

    output: {
        file: 'dist/index.es.js',
        format: 'es'
    },

    plugins: [
        resolve(),
        babel({ babelHelpers: 'bundled' })
    ]
};
