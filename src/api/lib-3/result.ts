/**
 * Type helper for representing errors as values.
 */
export interface Result<VAL, ERR> {
    isOk(): this is Ok<VAL, ERR>;

    isErr(): this is Err<VAL, ERR>;

    value(): VAL;

    error(): ERR;

    safeUnwrap(): Generator<Err<never, ERR>, VAL>;

    map<NEW_VAL>(fn: (value: VAL) => NEW_VAL): Result<NEW_VAL, ERR>;

    mapErr<NEW_ERR>(fn: (error: ERR) => NEW_ERR): Result<VAL, NEW_ERR>;

    andThrough(fn: (value: ERR) => void): Result<VAL, ERR>;
}

/**
 * Represents a successful computation.
 */
export class Ok<VAL, ERR> implements Result<VAL, ERR> {
    constructor(private _value: VAL) {}

    isOk(): this is Ok<VAL, ERR> {
        return true;
    }

    isErr(): this is Err<VAL, ERR> {
        return false;
    }

    value(): VAL {
        return this._value;
    }

    error(): ERR {
        throw new Error('Called `err` on an `Ok` value');
    }

    map<NEW_VAL>(fn: (value: VAL) => NEW_VAL): Result<NEW_VAL, ERR> {
        return new Ok(fn(this._value));
    }

    mapErr<NEW_ERR>(fn: (error: ERR) => NEW_ERR): Result<VAL, NEW_ERR> {
        return new Ok(this._value);
    }

    andThrough(_: (value: ERR) => void): Result<VAL, ERR> {
        return this;
    }

    safeUnwrap(): Generator<Err<never, ERR>, VAL> {
        const value = this._value;

        return (function* () {
            return value;
        })();
    }
}

/**
 * Represents a failed computation.
 */
export class Err<OK, ERR> implements Result<OK, ERR> {
    constructor(public _error: ERR) {}

    isOk(): this is Ok<OK, ERR> {
        return false;
    }

    isErr(): this is Err<OK, ERR> {
        return true;
    }

    value(): OK {
        throw new Error('Called `ok` on an `Err` value');
    }

    error(): ERR {
        return this._error;
    }

    map<NEW_OK>(fn: (value: OK) => NEW_OK): Result<NEW_OK, ERR> {
        return new Err(this._error);
    }

    mapErr<NEW_ERR>(fn: (error: ERR) => NEW_ERR): Result<OK, NEW_ERR> {
        return new Err(fn(this._error));
    }

    andThrough(fn: (value: ERR) => void): Result<OK, ERR> {
        fn(this._error);
        return this;
    }

    safeUnwrap(): Generator<Err<never, ERR>, OK> {
        const error = this._error;

        return (function* () {
            yield new Err(error);

            throw new Error('Called `safeUnwrap` on an `Err` value');
        })();
    }
}

/**
 * Helper function for creating an `Ok` value.
 */
export function ok<const VAL = void>(value?: VAL): Ok<VAL, never> {
    return new Ok(value ?? undefined) as Ok<VAL, never>;
}

/**
 * Helper function for creating an `Err` value.
 */
export function err<const ERR = void>(error?: ERR): Err<never, ERR> {
    return new Err(error ?? undefined) as Err<never, ERR>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Safely executes a function that may return an error.
 */
export function safeTry<OK, ERR>(
    fn: () => Generator<Err<never, ERR>, Result<OK, ERR>>,
): Result<OK, ERR>;

export function safeTry<OK, ERR>(
    fn: () => AsyncGenerator<Err<never, ERR>, Result<OK, ERR>>,
): Promise<Result<OK, ERR>>;

export function safeTry<OK, ERR>(
    fn:
        | (() => Generator<Err<never, ERR>, Result<OK, ERR>>)
        | (() => AsyncGenerator<Err<never, ERR>, Result<OK, ERR>>),
): Result<OK, ERR> | Promise<Result<OK, ERR>> {
    const result = fn().next();

    if (result instanceof Promise) {
        return result.then((result) => result.value);
    }
    return result.value;
}

////////////////////////////////////////////////////////////////////////////////////////////////////

const voidOK = ok();

const numberOK = ok(42);

const stringOK = ok('hello');

const objectOK = ok({
    hello: 'world',
});

////////////////////////////////////////////////////////////////////////////////////////////////////

const voidErr = err();

const numberErr = err(42);

const stringErr = err('hello');

const objectErr = err({
    hello: 'world',
});
