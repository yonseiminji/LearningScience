// A small JSON Schema checker, enough for the two planner schemas.
//
// Why not Ajv: this workspace cannot reach the npm registry, so nothing new
// can be installed. The keywords below are exactly the ones
// src/schemas/*.schema.json use — type, const, enum, required, properties,
// additionalProperties, items, maxItems, minLength, minimum, pattern, anyOf.
// Anything outside that list is ignored rather than silently passed off as
// checked, and `unsupportedKeywords` reports what was skipped.
//
// Swap this for Ajv once installs work: validateAgainstSchema's return shape
// is the same idea (ok + a list of errors carrying an instance path).
//
// Pure: no React, no DOM.

const SUPPORTED = new Set([
  '$schema',
  'title',
  'description',
  'type',
  'const',
  'enum',
  'required',
  'properties',
  'additionalProperties',
  'items',
  'maxItems',
  'minItems',
  'minLength',
  'minimum',
  'maximum',
  'pattern',
  'anyOf',
])

function typeOf(value) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (Number.isInteger(value)) return 'integer'
  if (typeof value === 'number') return 'number'
  return typeof value // 'string' | 'boolean' | 'object'
}

function matchesType(value, type) {
  const actual = typeOf(value)
  if (type === 'number') return actual === 'number' || actual === 'integer'
  if (type === 'object') return actual === 'object'
  return actual === type
}

function sameValue(a, b) {
  if (a === null || b === null) return a === b
  if (typeof a !== typeof b) return false
  if (typeof a === 'object') return JSON.stringify(a) === JSON.stringify(b)
  return a === b
}

function joinPath(path, key) {
  return `${path}/${String(key)}`
}

function check(value, schema, path, errors, unsupported) {
  if (!schema || typeof schema !== 'object') return

  for (const keyword of Object.keys(schema)) {
    if (!SUPPORTED.has(keyword)) unsupported.add(keyword)
  }

  if ('const' in schema && !sameValue(value, schema.const)) {
    errors.push({ path, keyword: 'const', message: `${JSON.stringify(schema.const)} 이어야 합니다`, value })
    return
  }

  if (Array.isArray(schema.enum) && !schema.enum.some((option) => sameValue(value, option))) {
    errors.push({
      path,
      keyword: 'enum',
      message: `허용된 값이 아닙니다 (${schema.enum.map((o) => JSON.stringify(o)).join(', ')})`,
      value,
    })
    return
  }

  if (Array.isArray(schema.anyOf)) {
    const matched = schema.anyOf.some((branch) => {
      const branchErrors = []
      check(value, branch, path, branchErrors, unsupported)
      return branchErrors.length === 0
    })
    if (!matched) {
      errors.push({ path, keyword: 'anyOf', message: '허용된 형식 중 어느 것에도 맞지 않습니다', value })
      return
    }
  }

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type]
    if (!types.some((type) => matchesType(value, type))) {
      errors.push({
        path,
        keyword: 'type',
        message: `${types.join(' 또는 ')} 타입이어야 합니다 (받은 값: ${typeOf(value)})`,
        value,
      })
      return
    }
  }

  if (typeof value === 'string') {
    if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
      errors.push({ path, keyword: 'minLength', message: `${schema.minLength}자 이상이어야 합니다`, value })
    }
    if (typeof schema.pattern === 'string' && !new RegExp(schema.pattern).test(value)) {
      errors.push({ path, keyword: 'pattern', message: `형식이 맞지 않습니다 (${schema.pattern})`, value })
    }
  }

  if (typeof value === 'number') {
    if (typeof schema.minimum === 'number' && value < schema.minimum) {
      errors.push({ path, keyword: 'minimum', message: `${schema.minimum} 이상이어야 합니다`, value })
    }
    if (typeof schema.maximum === 'number' && value > schema.maximum) {
      errors.push({ path, keyword: 'maximum', message: `${schema.maximum} 이하여야 합니다`, value })
    }
  }

  if (Array.isArray(value)) {
    if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) {
      errors.push({ path, keyword: 'maxItems', message: `${schema.maxItems}개 이하여야 합니다`, value: value.length })
    }
    if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
      errors.push({ path, keyword: 'minItems', message: `${schema.minItems}개 이상이어야 합니다`, value: value.length })
    }
    if (schema.items) {
      value.forEach((item, index) => check(item, schema.items, joinPath(path, index), errors, unsupported))
    }
  }

  if (typeOf(value) === 'object') {
    for (const key of schema.required || []) {
      if (!(key in value)) {
        errors.push({ path: joinPath(path, key), keyword: 'required', message: '빠진 항목입니다', value: undefined })
      }
    }
    const properties = schema.properties || {}
    for (const [key, sub] of Object.entries(properties)) {
      if (key in value) check(value[key], sub, joinPath(path, key), errors, unsupported)
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) {
          errors.push({ path: joinPath(path, key), keyword: 'additionalProperties', message: '모르는 항목입니다', value: value[key] })
        }
      }
    }
  }
}

export function validateAgainstSchema(value, schema) {
  const errors = []
  const unsupported = new Set()
  check(value, schema, '', errors, unsupported)
  return {
    ok: errors.length === 0,
    errors,
    unsupportedKeywords: [...unsupported].filter((keyword) => !SUPPORTED.has(keyword)),
  }
}
