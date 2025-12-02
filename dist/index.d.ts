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
interface WhitelistOptions {
    strict: boolean;
    caseSensitive: boolean;
}
interface Rule {
    type: string;
    original: string;
    regex?: RegExp;
    raw?: string;
}
declare function parseRule(rule: string, strict?: boolean): Rule | null;

export { type WhitelistOptions, parseRule };
