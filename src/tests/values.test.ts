import allowly from '@lib/allowly.js';
import { assert, describe, it } from 'vitest';

describe('isValueWhitelisted — positive cases', () => {
  it('matches exact value in array', () => {
    assert.isTrue(allowly('value', ['some', 'value']));
  });
  it('matches exact value in array (case-sensitive)', () => {
    assert.isTrue(allowly('Value', ['some', 'Value'], { caseSensitive: true }));
  });

  it('matches wildcard at start (*value)', () => {
    assert.isTrue(allowly('value', ['*value']));
  });

  it('matches wildcard at end (value*)', () => {
    assert.isTrue(allowly('value', ['value*']));
  });

  it('matches wildcard around (*value*)', () => {
    assert.isTrue(allowly('value', ['*value*']));
  });

  it('matches at least one rule from multiple', () => {
    assert.isTrue(allowly('value', ['nope', 'v*', 'zzz']));
  });

  it('matches global wildcard (*)', () => {
    assert.isTrue(allowly('value', ['*']));
  });

  it('duplicates do not break logic', () => {
    assert.isTrue(allowly('value', ['value', 'value', '*value']));
  });

  it('special characters inside string are treated literally', () => {
    assert.isTrue(allowly('va!lue', ['va!lue']));
  });
});

describe('isValueWhitelisted — negative cases', () => {
  it('empty whitelist denies everything', () => {
    assert.isFalse(allowly('value', []));
  });
  it('empty string value does not match anything', () => {
    assert.isFalse(allowly('', ['value', '*value'], { strict: false }));
  });

  it('value not in array', () => {
    assert.isFalse(allowly('value', ['some', 'another']));
  });

  it('blacklist overrides allow', () => {
    assert.isFalse(allowly('value', ['v*', '!value']));
  });

  it('blacklist single value', () => {
    assert.isFalse(allowly('value', ['some', '!value']));
  });
  it('blacklist case sensitive', () => {
    assert.isTrue(allowly('Value', ['*', '!value'], { caseSensitive: true }));
  });

  it('blacklist with global allow (*)', () => {
    assert.isFalse(allowly('value', ['*', '!value']));
  });

  it('deny starts with value (!value*)', () => {
    assert.isFalse(allowly('value', ['!value*']));
  });

  it('deny ends with value (!*value)', () => {
    assert.isFalse(allowly('value', ['!*value']));
  });

  it('deny contains value (!*value*)', () => {
    assert.isFalse(allowly('value', ['!*value*']));
  });

  it('blacklist is case-insensitive', () => {
    assert.isFalse(allowly('Value', ['!value']));
  });
});

describe('isValueWhitelisted — regexp rules', () => {
  it('regexp match exact', () => {
    assert.isTrue(allowly('value', ['/value/']));
  });

  it('regexp match with flag i', () => {
    assert.isTrue(allowly('value', ['/value/i']));
  });

  it('regexp match with escaped slashes', () => {
    assert.isTrue(allowly('a/b/c', ['/a\\/b\\/c/']));
  });

  it('regexp mismatch', () => {
    assert.isFalse(allowly('value', ['/^test.*/']));
  });

  it('invalid regexp ignored in non-strict mode', () => {
    assert.isFalse(allowly('value', ['/[unclosed/'], { strict: false, caseSensitive: false }));
  });

  it('invalid regexp throws in strict mode', () => {
    assert.throws(() => {
      allowly('value', ['/[unclosed/'], { strict: true, caseSensitive: false });
    });
  });
});
