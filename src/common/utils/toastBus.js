// src/common/utils/toastBus.js
// Minimal pub-sub so both React components and plain JS (apiClient.js)
// can trigger global toasts without needing a React context.

let listeners = [];

export const subscribeToast = (fn) => {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
};

export const pushToast = (message, type = "error") => {
  listeners.forEach((fn) => fn({ message, type }));
};