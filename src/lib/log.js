export default function log (label, ...extra) {
  return (...args) => {
    if (window.R5.DEBUG && window && window.console) {
      console.log(label, ...extra, ...args);
    }
    return args[0];
  };
}
