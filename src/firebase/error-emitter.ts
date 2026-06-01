'use client';

// A simple but effective event emitter.
type Listener = (data: any) => void;

class EventEmitter {
  private listeners: { [event: string]: Listener[] } = {};

  public on(event: string, listener: Listener): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);

    // Return an unsubscribe function
    return () => {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(
          (l) => l !== listener
        );
      }
    };
  }

  public emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => listener(data));
    }
  }
}

export const errorEmitter = new EventEmitter();
