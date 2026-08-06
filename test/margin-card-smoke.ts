import assert from "node:assert/strict";
import {
  fitFoldedMarginCardHeights,
  foldedMarginCardHeight,
  marginCardSourceText,
} from "../src/margin-card";

const longPassage = `${"A complete annotation must remain visible. ".repeat(8)}\n\tFinal sentence.`;
const result = marginCardSourceText(longPassage);

assert.ok(result.length > 180, "long margin-card text must not be truncated to the old 180-character preview");
assert.ok(result.endsWith("Final sentence."), "the end of the annotation must be retained");
assert.equal(result.includes("\n"), false, "PDF text-layer whitespace should be normalised");
assert.equal(result.includes("\t"), false, "PDF text-layer whitespace should be normalised");

const short = foldedMarginCardHeight(30);
const medium = foldedMarginCardHeight(330);
const long = foldedMarginCardHeight(630);
const extreme = foldedMarginCardHeight(9000);
assert.ok(short < medium && medium < long, "resting card height must preserve relative content length");
assert.ok(long - medium < medium - short, "the folding curve must compress increasingly long annotations");
assert.ok(long - short >= 90, "very different comment lengths need a visibly different resting height");
assert.equal(extreme, 188, "folded cards must stay bounded on dense pages");

const fitted = fitFoldedMarginCardHeights([60, 94, 132, 180], 310);
assert.ok(fitted[0] < fitted[1] && fitted[1] < fitted[2] && fitted[2] < fitted[3]);
assert.ok(fitted.reduce((sum, height) => sum + height, 0) <= 312, "a busy rail must fit its budget");
assert.ok(fitted[3] - fitted[0] >= 20, "density folding must retain a visible length hierarchy");

console.log("margin card content smoke: ok");
