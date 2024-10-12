export default class Completer {
    private _promise;
    private _resolve: ((value: unknown) => void) | undefined;
    private _reject: ((reason?: unknown) => void) | undefined;

    constructor() {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    private _isCompleted = false;

    get isCompleted() {
        return this._isCompleted;
    }

    get future() {
        return this._promise;
    }

    complete(value: unknown) {
        this._isCompleted = true;
        this._resolve?.(value);
    }

    completeError(error: unknown) {
        this._reject?.(error);
    }
}