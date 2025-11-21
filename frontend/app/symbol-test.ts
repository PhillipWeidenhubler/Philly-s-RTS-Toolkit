import { renderSymbolSVG } from "./src/services/symbolService";

const svg = renderSymbolSVG({ sidc: "SFGPUCI----US----" } as any);
console.log(svg ? svg.slice(0, 120) : "null");
