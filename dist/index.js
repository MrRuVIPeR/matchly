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
export {
  index_default as default,
  parseRule
};
