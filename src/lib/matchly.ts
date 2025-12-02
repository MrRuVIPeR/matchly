/**
 * Проверяет, является ли значение в списке разрешённых.
 * Понимает следующие правила:
 * value - значение для проверки
 * * - все значения в списке разрешённых
 * !value - не в списке разрешённых
 *
 * Значения проверяются в три этапа:
 * 1. Исключающие значения. Например, ["*", "!value"] - все значения кроме "value"
 * 2. Полное совпадение. Например, ["value"] - только "value"
 * 3. Частичное совпадение. Например, ["*value"] - любое значение, заканчивающееся на "value"
 * 4. Частичное совпадение. Например, ["*value*"] - любое значение, которое содержит "value"
 * 5. Частичное совпадение. Например, ["value*"] - любое значение, начинающееся на "value"
 *
 */
export interface WhitelistOptions {
  strict: boolean;
  caseSensitive: boolean;
}
export default function matchly(value: string, rules: string[], options: Partial<WhitelistOptions> = { strict: true, caseSensitive: false }) {
  const opt = { strict: false, caseSensitive: false, ...options };
  let normalizedValue = value;
  if (!opt.caseSensitive) {
    normalizedValue = value.toLowerCase();
  }

  const parsed = rules.map((rule) => parseRule(rule, opt.strict)).filter((i) => i) as Rule[];
  const denyRules = parsed.filter((rule) => rule.type === 'deny');
  const allowRules = parsed.filter((rule) => rule.type === 'allow');

  // Check deny rules
  for (const rule of denyRules) {
    if (matchRule(normalizedValue, rule)) return false;
  }

  // Check allowRules
  for (const rule of allowRules) {
    if (matchRule(normalizedValue, rule)) return true;
  }

  // Check other rules
  for (const rule of allowRules) {
    if (matchRule(normalizedValue, rule)) return true;
  }

  return false;
}

interface Rule {
  type: string;
  original: string;
  regex?: RegExp;
  raw?: string;
}
export function parseRule(rule: string, strict: boolean = true): Rule | null {
  const original = rule;
  const unescaped = rule.replace(/\\(.)/g, '$1');

  // Regexp rule
  const regexMatch = /^\/(.+)\/([a-z]*)$/i.exec(unescaped);
  if (regexMatch) {
    const [, body, flags] = regexMatch;
    try {
      const regex = new RegExp(body, flags || 'i');
      return {
        type: 'allow',
        original,
        regex,
        raw: unescaped,
      };
    } catch (e) {
      if (strict) throw e;
      // ignore rule
      console.error(`Invalid RegExp rule will be ignored: ${body}`);
      return null;
    }
  }

  const isNegotiation = unescaped.startsWith('!');
  const stripped = unescaped.slice(isNegotiation ? 1 : 0);

  return {
    type: isNegotiation ? 'deny' : 'allow',
    original,
    raw: stripped,
  };
}

function matchRule(value: string, rule: Rule): boolean {
  // Regexp rule
  if (rule.regex) {
    return rule.regex.test(value);
  }

  const pattern = rule.raw;

  // Exact match
  if (!pattern?.includes('*')) return value === pattern;

  // Wildcard rule match
  if (pattern === '*') return true;

  // Partial match
  if (pattern.startsWith('*') && pattern.endsWith('*')) {
    return value.includes(pattern.slice(1, -1));
  }

  if (pattern.startsWith('*')) {
    return value.endsWith(pattern.slice(1));
  }

  if (pattern.endsWith('*')) {
    return value.startsWith(pattern.slice(0, -1));
  }

  return value === pattern;
}
