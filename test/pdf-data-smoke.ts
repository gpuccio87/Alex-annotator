import assert from "node:assert/strict";
import { copyPdfDataForWorker } from "../src/pdf-data";

const original = Uint8Array.from([37, 80, 68, 70, 45, 49, 46, 55]).buffer;
const workerData = copyPdfDataForWorker(original);

assert.notEqual(workerData.buffer, original, "the worker receives an independent buffer");
assert.deepEqual(new Uint8Array(workerData), new Uint8Array(original));

// Model pdf.js' transferable postMessage. Its copy is detached, while the
// original vault bytes must remain available to the bundle manager.
structuredClone(workerData, { transfer: [workerData.buffer] });

assert.equal(workerData.byteLength, 0, "the worker copy was transferred and detached");
assert.equal(original.byteLength, 8, "the retained PDF bytes remain attached");
assert.deepEqual(
  new Uint8Array(original),
  Uint8Array.from([37, 80, 68, 70, 45, 49, 46, 55])
);

console.log("pdf worker data copy smoke test passed");
