# allowly

[en](README.md)
[ru](README.ru.md)

A lightweight, expressive rule-based matcher for whitelisting and blacklisting string values.

Supports:

* Full match (`"value"`)
* Wildcards (`*value`, `value*`, `*value*`)
* Global allow (`"*"`)
* Negations (`!value`, `!value*`)
* Escaped characters (`\*`, `\!`, `\/`)
* Regular expressions (`/pattern/i`)

---

## Installation

```bash
npm install allowly
```

---

## Usage

```ts
import allowly from "allowly";

allowly("admin", ["*"]);              // true
allowly("admin", ["!admin"]);          // false
allowly("superadmin", ["admin*"]);     // true
allowly("user-42", ["/user-\\d+/i"]); // true
```

## Options

```js
  allowly(value: string, rules: string[], options: Partial<WhitelistOptions> = { strict: true, caseSensitive: false })
```
* `strict: boolean` - strict mode
* `caseSensitive: boolean` - case sensitive mode

---

## Rule Types

### 1. Full Match

```ts
["value"] → only matches "value"
```

### 2. Global Match

```ts
["*"] → allows everything
```

### 3. Negation

```ts
["!value"] → denies "value"
["!value*"] → denies everything starting with "value"
```

### 4. Wildcards

```ts
["value*"]   → starts with
["*value"]   → ends with
["*value*"]  → contains
```

### 5. Escaping

```ts
["\\*"] → literal "*"
["\\!"] → literal "!"
["\\/"] → literal "/"
```

### 6. RegExp

```ts
["/foo/i"] → case-insensitive regexp
["/^user-\\d+$/"] → strict match
```

---

## Priority

1. Deny rules
2. Allow rules
3. Wildcards & RegExp

---

## License

MIT
