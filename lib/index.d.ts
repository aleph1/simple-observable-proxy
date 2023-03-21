export type Observable = {
    [name: string]: any;
};
export type ObservableCallback = () => void;
export declare const ObservableEvents: {
    readonly change: "change";
    readonly destroy: "destroy";
};
type ObservableEventKey = keyof typeof ObservableEvents;
export type ObservableEvent = typeof ObservableEvents[ObservableEventKey];
type ObservableCallbackObject = {
    change: Set<ObservableCallback>;
    destroy: Set<ObservableCallback>;
};
export type ObservableCallbackMap = Map<Observable, ObservableCallbackObject>;
export declare const observable: (data: Observable) => Observable;
export declare const on: (observableProxy: Observable, eventType: ObservableEventKey, callback: ObservableCallback) => boolean;
export declare const off: (observableProxy: Observable, eventType: ObservableEventKey, callback: ObservableCallback) => boolean;
export declare const observe: (observableProxy: Observable, callback: ObservableCallback) => boolean;
export declare const unobserve: (observableProxy: Observable, callback: ObservableCallback) => boolean;
export declare const destroy: (observableProxy: Observable) => boolean;
export {};
