// @flow

export const flatten = <T>(array: T[]) => array.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);