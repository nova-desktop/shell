const setup = `const { PI, abs, sin, cos, tan, asin, acos, atan, sqrt, atan2, log2, log, E } = Math;`;

function evaluateExpression(expression: string) {
  return eval(`${setup}${expression}`);
}
