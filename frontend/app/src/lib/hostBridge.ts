type HostEnvelope<TPayload = unknown> = {
  type: string;
  payload?: TPayload;
};

declare global {
  interface Window {
    chrome?: {
      webview?: {
        postMessage: (data: HostEnvelope) => void;
        addEventListener: (event: "message", handler: (event: { data: HostEnvelope }) => void) => void;
      };
    };
  }
}

type HostHandler = (payload: unknown) => void;

class HostBridge {
  private listeners = new Map<string, Set<HostHandler>>();
  public readonly isAvailable: boolean;

  constructor() {
    this.isAvailable = Boolean(window.chrome?.webview);
    if (this.isAvailable) {
      window.chrome?.webview?.addEventListener("message", (event) => this.handleEnvelope(event?.data));
    } else {
      console.info("[HostBridge] Running without desktop host; messaging will be no-ops.");
    }
  }

  private handleEnvelope(envelope?: HostEnvelope): void {
    if (!envelope || typeof envelope !== "object" || !envelope.type) return;
    this.emit(envelope.type, envelope.payload);
  }

  postMessage<TPayload = unknown>(type: string, payload?: TPayload): void {
    if (!this.isAvailable) {
      console.warn(`[HostBridge] Skipping "${type}" message because WebView host is unavailable.`);
      return;
    }
    window.chrome!.webview!.postMessage({ type, payload });
  }

  request<TRequest = unknown, TResponse = unknown>(
    type: string,
    payload?: TRequest,
    responseType?: string,
    timeoutMs = 10000
  ): Promise<TResponse> {
    if (!this.isAvailable) {
      return Promise.reject(new Error("Host bridge is not available."));
    }
    const waitType = responseType ?? type;
    const waitPromise = this.waitFor<TResponse>(waitType, timeoutMs);
    this.postMessage(type, payload);
    return waitPromise;
  }

  waitFor<TPayload = unknown>(type: string, timeoutMs = 10000): Promise<TPayload> {
    return new Promise((resolve, reject) => {
      const handler: HostHandler = (payload) => {
        this.off(type, handler);
        clearTimeout(timeoutId);
        resolve(payload as TPayload);
      };

      const timeoutId = window.setTimeout(() => {
        this.off(type, handler);
        reject(new Error(`Timed out waiting for host payload "${type}"`));
      }, timeoutMs);

      this.on(type, handler);
    });
  }

  on<TPayload = unknown>(type: string, handler: (payload: TPayload) => void): () => void {
    const existing = this.listeners.get(type) ?? new Set<HostHandler>();
    existing.add(handler as HostHandler);
    this.listeners.set(type, existing);
    return () => this.off(type, handler as HostHandler);
  }

  off(type: string, handler: HostHandler): void {
    const existing = this.listeners.get(type);
    if (!existing) return;
    existing.delete(handler);
    if (!existing.size) this.listeners.delete(type);
  }

  private emit(type: string, payload: unknown): void {
    const set = this.listeners.get(type);
    if (!set) return;
    set.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[HostBridge] Listener for "${type}" failed`, error);
      }
    });
  }
}

export const hostBridge = new HostBridge();
