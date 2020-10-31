import nodePolyfills from "rollup-plugin-node-polyfills";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";

export default [
    // browser-friendly UMD build
    {
        input: "dist/src/index.js",
        output: {
            name: "@mindconnect/mindconnect-nodejs",
            file: pkg.browser,
            format: "umd",
        },
        plugins: [
            resolve({
                preferBuiltins: true,
            }),
            commonjs({ extensions: [".js", ".ts"] }), // the ".ts" extension is required
            nodePolyfills(),
            json(),
            terser(),
        ],
    },
];
