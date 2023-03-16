export type PlainObject = {
    [name: string]: any;
};
type ObservableCallback = () => void;
export declare const observable: (data: any) => PlainObject | boolean;
export declare const observe: (observableProxy: any, callback: ObservableCallback) => boolean;
export declare const unobserve: (observableProxy: any | PlainObject, callback: ObservableCallback) => boolean;
export declare const destroy: (observableProxy: any) => boolean;
export {};
