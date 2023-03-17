export type Observable = {
    [name: string]: any;
};
export type ObservableCallback = () => void;
export declare const observable: (data: Observable) => Observable;
export declare const observe: (observableProxy: Observable, callback: ObservableCallback) => boolean;
export declare const unobserve: (observableProxy: Observable, callback: ObservableCallback) => boolean;
export declare const destroy: (observableProxy: Observable) => boolean;
