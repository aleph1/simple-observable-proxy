import browserify from "browserify";
import {minify} from "terser";
import fs from 'fs';

const result = await minify(
	fs.readFileSync("index.js", "utf8"),
	{
		toplevel: true
	}
);

fs.writeFileSync("dist/simple-observable-proxy.js", result.code);