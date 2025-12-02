import matchly from '@lib/matchly.js';
import { assert, describe, it } from 'vitest';

describe('isValueWhitelisted — positive cases', () => {
  it('matches exact value in array', () => {
    assert.isTrue(matchly('value', ['some', 'value']));
  });
  it('matches exact value in array (case-sensitive)', () => {
    assert.isTrue(matchly('Value', ['some', 'Value'], { caseSensitive: true }));
  });

  it('matches wildcard at start (*value)', () => {
    assert.isTrue(matchly('value', ['*value']));
  });

  it('matches wildcard at end (value*)', () => {
    assert.isTrue(matchly('value', ['value*']));
  });

  it('matches wildcard around (*value*)', () => {
    assert.isTrue(matchly('value', ['*value*']));
  });

  it('matches at least one rule from multiple', () => {
    assert.isTrue(matchly('value', ['nope', 'v*', 'zzz']));
  });

  it('matches global wildcard (*)', () => {
    assert.isTrue(matchly('value', ['*']));
  });

  it('duplicates do not break logic', () => {
    assert.isTrue(matchly('value', ['value', 'value', '*value']));
  });

  it('special characters inside string are treated literally', () => {
    assert.isTrue(matchly('va!lue', ['va!lue']));
  });
});

describe('isValueWhitelisted — negative cases', () => {
  it('empty whitelist denies everything', () => {
    assert.isFalse(matchly('value', []));
  });
  it('empty string value does not match anything', () => {
    assert.isFalse(matchly('', ['value', '*value']));
  });

  it('value not in array', () => {
    assert.isFalse(matchly('value', ['some', 'another']));
  });

  it('blacklist overrides allow', () => {
    assert.isFalse(matchly('value', ['v*', '!value']));
  });

  it('blacklist single value', () => {
    assert.isFalse(matchly('value', ['some', '!value']));
  });
  it('blacklist case sensitive', () => {
    assert.isTrue(matchly('Value', ['*', '!value'], { caseSensitive: true }));
  });

  it('blacklist with global allow (*)', () => {
    assert.isFalse(matchly('value', ['*', '!value']));
  });

  it('deny starts with value (!value*)', () => {
    assert.isFalse(matchly('value', ['!value*']));
  });

  it('deny ends with value (!*value)', () => {
    assert.isFalse(matchly('value', ['!*value']));
  });

  it('deny contains value (!*value*)', () => {
    assert.isFalse(matchly('value', ['!*value*']));
  });

  it('blacklist is case-insensitive', () => {
    assert.isFalse(matchly('Value', ['!value']));
  });
});

describe('isValueWhitelisted — regexp rules', () => {
  it('regexp match exact', () => {
    assert.isTrue(matchly('value', ['/value/']));
  });

  it('regexp match with flag i', () => {
    assert.isTrue(matchly('value', ['/value/i']));
  });

  it('regexp match with escaped slashes', () => {
    assert.isTrue(matchly('a/b/c', ['/a\\/b\\/c/']));
  });

  it('regexp mismatch', () => {
    assert.isFalse(matchly('value', ['/^test.*/']));
  });

  it('invalid regexp ignored in non-strict mode', () => {
    assert.isFalse(matchly('value', ['/[unclosed/'], { strict: false, caseSensitive: false }));
  });

  it('invalid regexp throws in strict mode', () => {
    assert.throws(() => {
      matchly('value', ['/[unclosed/'], { strict: true, caseSensitive: false });
    });
  });
});
