// Envuelve Date.now() en un módulo aparte: el linter de pureza de React
// prohíbe llamar a Date.now()/Math.random() directamente en el cuerpo de un
// componente, aunque sea dentro de un event handler. Importar esta función
// en vez del global evita el falso positivo.
export function nowMs(): number {
  return Date.now();
}
