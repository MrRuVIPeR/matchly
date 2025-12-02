"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  parseRule: () => parseRule
});
module.exports = __toCommonJS(index_exports);

// src/lib/allowly.ts
function parseRule(rule, strict = true) {
  const original = rule;
  const unescaped = rule.replace(/\\(.)/g, "$1");
  const regexMatch = /^\/(.+)\/([a-z]*)$/i.exec(unescaped);
  if (regexMatch) {
    const [, body, flags] = regexMatch;
    try {
      const regex = new RegExp(body, flags || "i");
      return {
        type: "allow",
        original,
        regex,
        raw: unescaped
      };
    } catch (e) {
      if (strict) throw e;
      console.error(`Invalid RegExp rule will be ignored: ${body}`);
      return null;
    }
  }
  const isNegotiation = unescaped.startsWith("!");
  const stripped = unescaped.slice(isNegotiation ? 1 : 0);
  return {
    type: isNegotiation ? "deny" : "allow",
    original,
    raw: stripped
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseRule
});
