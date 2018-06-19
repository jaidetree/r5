const methods = ['trace', 'error', 'log'];

/**
 * log :: (String, ...[String]) -> (input, ...args) -> input
 *
 * Simple log function that will only log output when in DEBUG mode
 * and is designed for use in callbacks.
 *
 * Example:
 * [ 1, 2, 3 ].map(log('Incoming number:'))
 * => [ 1, 2, 3 ]
 * "Incoming number: 1"
 * "Incoming number: 2"
 * "Incoming number: 3"
 */
export default function log (label, ...extra) {
  return (...args) => {
    const methodName = methods.includes(extra[0]) ? extra[0] : 'log';

    // only write to console when debugging
    if (window.R5.DEBUG && window && window.console) {
      console[methodName](label, ...extra, ...args);
    }

    return args[0];
  };
}
