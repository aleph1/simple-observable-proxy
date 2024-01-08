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
export declare const observableEvents: {
    readonly change: "change";
    readonly destroy: "destroy";
};
type ObservableEventKey = keyof typeof observableEvents;
export type ObservableEvent = typeof observableEvents[ObservableEventKey];
export declare const isPlainObject: (data: {
    [name: string]: any;
}) => boolean;
export declare const observable: (data: Observable) => Observable;
export declare const isObservable: (observableProxy: Observable) => boolean;
export declare const observableObject: (data: ObservableObject) => ObservableObject;
export declare const observableArray: (data: ObservableObject) => ObservableArray;
export declare const observableMap: (data: ObservableMap) => ObservableMap;
export declare const on: (observableProxy: Observable, eventType: ObservableEventKey, callback: ObservableCallback) => boolean;
export declare const off: (observableProxy: Observable, eventType: ObservableEventKey, callback: ObservableCallback) => boolean;
export declare const destroy: (observableProxy: Observable) => boolean;
export {};
