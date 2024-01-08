export type ObservableArray = {
    [name: string]: any;
};
export type ObservableObject = {
    [name: string]: any;
};
export type ObservableMap = {
    [name: string]: any;
};
export type Observable = ObservableArray | ObservableObject | ObservableMap;
export type ObservableCallback = (proxy: Observable) => void;
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
export declare const observableObject: (data: ObservableObject) => ObservableObject;
export declare const observableArray: (data: ObservableObject) => ObservableArray;
export declare const observableMap: (data: ObservableMap) => ObservableMap;
export declare const on: (observableProxy: Observable, eventType: ObservableEventKey, callback: ObservableCallback) => boolean;
export declare const off: (observableProxy: Observable, eventType: ObservableEventKey, callback: ObservableCallback) => boolean;
export declare const destroy: (observableProxy: Observable) => boolean;
export {};
