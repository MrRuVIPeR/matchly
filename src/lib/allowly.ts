/**
 * Проверяет, является ли значение разрешённым.
 *
 * Поддерживает правила:
 *
 * value      - точное совпадение
 * *          - любое значение
 * *value     - значение заканчивается на value
 * value*     - значение начинается с value
 * *value*    - значение содержит value
 * !value     - исключение (запрещающее правило)
 * /regexp/i  - регулярное выражение
 *
 * Приоритет:
 * 1. Исключающие правила
 * 2. Разрешающие правила
 */
export interface WhitelistOptions {
  strict: boolean;
  caseSensitive: boolean;
}

export default function allowly(value: string, rules: string[], options: Partial<WhitelistOptions> = {}): boolean {
  const opt: WhitelistOptions = {
    strict: true,
    caseSensitive: false,
    ...options,
  };

  if (!value && opt.strict) {
    throw new Error('Value is required');
  }

  if (!value) {
    return false;
  }

  const normalizedValue = normalize(value, opt.caseSensitive);

  const parsedRules = rules.map((rule) => parseRule(rule, opt)).filter(Boolean) as Rule[];

  const denyRules = parsedRules.filter((rule) => rule.type === 'deny');

  const allowRules = parsedRules.filter((rule) => rule.type === 'allow');

  // deny всегда сильнее allow
  if (denyRules.some((rule) => matchRule(normalizedValue, rule))) {
    return false;
  }

  return allowRules.some((rule) => matchRule(normalizedValue, rule));
}

interface Rule {
  type: 'allow' | 'deny';
  original: string;
  raw?: string;
  regex?: RegExp;
}

function normalize(value: string, caseSensitive: boolean): string {
  return caseSensitive ? value : value.toLowerCase();
}

export function parseRule(rule: string, options: WhitelistOptions): Rule | null {
  const original = rule;

  let normalizedRule = rule.replace(/\\(.)/g, '$1');

  if (!options.caseSensitive) {
    normalizedRule = normalizedRule.toLowerCase();
  }

  // RegExp rule
  const regexMatch = /^\/(.+)\/([a-z]*)$/i.exec(normalizedRule);

  if (regexMatch) {
    const [, body, flags] = regexMatch;

    try {
      return {
        type: 'allow',
        original,
        regex: new RegExp(body, flags),
      };
    } catch (error) {
      if (options.strict) {
        throw error;
      }

      console.error(`Invalid RegExp rule ignored: ${body}`);

      return null;
    }
  }

  const deny = normalizedRule.startsWith('!');

  const raw = deny ? normalizedRule.slice(1) : normalizedRule;

  return {
    type: deny ? 'deny' : 'allow',
    original,
    raw,
  };
}

function matchRule(value: string, rule: Rule): boolean {
  if (rule.regex) {
    return rule.regex.test(value);
  }

  const pattern = rule.raw;

  if (!pattern) {
    return false;
  }

  // Все значения
  if (pattern === '*') {
    return true;
  }

  // Точное совпадение
  if (!pattern.includes('*')) {
    return value === pattern;
  }

  // *value*
  if (pattern.startsWith('*') && pattern.endsWith('*')) {
    return value.includes(pattern.slice(1, -1));
  }

  // *value
  if (pattern.startsWith('*')) {
    return value.endsWith(pattern.slice(1));
  }

  // value*
  if (pattern.endsWith('*')) {
    return value.startsWith(pattern.slice(0, -1));
  }

  return false;
}
