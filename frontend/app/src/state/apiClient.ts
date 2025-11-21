import { z } from "zod";
import { hostBridge } from "../lib/hostBridge";

const isSandbox = import.meta.env.VITE_SANDBOX === "1";

type MaybePromise<T> = T | Promise<T>;

export interface ApiRequestOptions<TRequest, TResponse> {
    type: string;
    responseType: string;
    payload?: TRequest;
    schema: z.ZodTypeAny;
    sandbox?: () => MaybePromise<unknown>;
}

export async function invokeRequest<TRequest, TResponse>(options: ApiRequestOptions<TRequest, TResponse>): Promise<TResponse> {
    if (isSandbox || !hostBridge.isAvailable) {
        if (!options.sandbox) {
            throw new Error(`Sandbox handler missing for ${options.type}`);
        }
        const sandboxPayload = await options.sandbox();
        return options.schema.parse(sandboxPayload) as TResponse;
    }

    const raw = await hostBridge.request<TRequest, unknown>(options.type, options.payload, options.responseType);
    return options.schema.parse(raw) as TResponse;
}

export function registerHostListener<T>(type: string, schema: z.ZodType<T>, handler: (data: T) => void): void {
    if (!hostBridge.isAvailable) return;
    hostBridge.on<T>(type, (payload) => {
        const parsed = schema.safeParse(payload);
        if (!parsed.success) {
            console.error(`[apiClient] Failed to parse host payload for ${type}`, parsed.error.flatten());
            return;
        }
        handler(parsed.data);
    });
}
