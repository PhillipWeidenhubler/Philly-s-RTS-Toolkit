"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbolService_1 = require("./src/services/symbolService");
const svg = (0, symbolService_1.renderSymbolSVG)({ sidc: "SFGPUCI----US----" });
console.log(svg ? svg.slice(0, 120) : "null");
