// A simple event emitter for handling global application events.
// This is used to decouple components and services, allowing them to
// communicate without direct dependencies.

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

export function createEmitter<T extends EventMap>(): Emitter<T> {
  const listeners: { [K in keyof T]?: Array<(p: T[K]) => void> } = {};

  return {
    on(eventName, fn) {
      listeners[eventName] = (listeners[eventName] || []).concat(fn);
    },
    off(eventName, fn) {
      listeners[eventName] = (listeners[eventName] || []).filter(
        (f) => f !== fn
      );
    },
    emit(eventName, params) {
      (listeners[eventName] || []).forEach(function (fn) {
        fn(params);
      });
    },
  };
}

// Define the types for your events here
interface AppEvents {
    'permission-error': any;
}

export const errorEmitter = createEmitter<AppEvents>();
