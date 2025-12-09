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
  default: () => index_default,
  parseRule: () => parseRule
});
module.exports = __toCommonJS(index_exports);

// src/lib/allowly.ts
function allowly(value, rules, options = { strict: true, caseSensitive: false }) {
  const opt = { strict: false, caseSensitive: false, ...options };
  let normalizedValue = value;
  if (!normalizedValue && opt.strict) throw new Error("Value is required");
  if (!normalizedValue) return false;
  if (!opt.caseSensitive) {
    normalizedValue = value.toLowerCase();
  }
  const parsed = rules.map((rule) => parseRule(rule, opt.strict)).filter((i) => i);
  const denyRules = parsed.filter((rule) => rule.type === "deny");
  const allowRules = parsed.filter((rule) => rule.type === "allow");
  for (const rule of denyRules) {
    if (matchRule(normalizedValue, rule)) return false;
  }
  for (const rule of allowRules) {
    if (matchRule(normalizedValue, rule)) return true;
  }
  for (const rule of allowRules) {
    if (matchRule(normalizedValue, rule)) return true;
  }
  return false;
}
function parseRule(rule, strict = true, caseSensitive = false) {
  const original = rule;
  let unescaped = rule.replace(/\\(.)/g, "$1");
  if (!caseSensitive) unescaped = unescaped.toLowerCase();
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
function matchRule(value, rule) {
  if (rule.regex) {
    return rule.regex.test(value);
  }
  const pattern = rule.raw;
  if (!pattern?.includes("*")) return value === pattern;
  if (pattern === "*") return true;
  if (pattern.startsWith("*") && pattern.endsWith("*")) {
    return value.includes(pattern.slice(1, -1));
  }
  if (pattern.startsWith("*")) {
    return value.endsWith(pattern.slice(1));
  }
  if (pattern.endsWith("*")) {
    return value.startsWith(pattern.slice(0, -1));
  }
  return value === pattern;
}

// src/index.ts
var result = allowly("NG", ["CA", "CC", "NG"]);
var index_default = allowly;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseRule
});
