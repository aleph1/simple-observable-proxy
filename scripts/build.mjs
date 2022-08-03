import {minify} from "terser";
import fs from 'fs';

const result = await minify(
	fs.readFileSync("index.js", "utf8"),
	{
		toplevel: true
	}
);

fs.writeFileSync("dist/observable.min.js", result.code);