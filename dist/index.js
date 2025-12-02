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
export {
  parseRule
};
