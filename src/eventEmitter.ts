export class EventEmitter {
  // deno-lint-ignore ban-types
  private events: Map<string, Function[]> = new Map();

  // deno-lint-ignore ban-types
  on(event: string, listener: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  // deno-lint-ignore ban-types
  off(event: string, listener: Function) {
    const listeners = this.events.get(event);
    if (listeners) {
      this.events.set(event, listeners.filter((l) => l !== listener));
    }
  }

  // deno-lint-ignore no-explicit-any
  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(...args));
    }
  }
}
