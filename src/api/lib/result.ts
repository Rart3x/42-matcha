export interface Result<OK, ERR> {
    isOk(): this is Ok<OK, ERR>;

    isErr(): this is Err<OK, ERR>;

    ok(): OK;

    err(): ERR;

    safeUnwrap(): Generator<Err<never, ERR>, OK>;

    map<NEW_OK>(fn: (value: OK) => NEW_OK): Result<NEW_OK, ERR>;

    mapErr<NEW_ERR>(fn: (error: ERR) => NEW_ERR): Result<OK, NEW_ERR>;

    andThrough(fn: (value: ERR) => void): Result<OK, ERR>;
}

export class Ok<OK, ERR> implements Result<OK, ERR> {
    constructor(public value: OK) {}

    isOk(): this is Ok<OK, ERR> {
        return true;
    }

    isErr(): this is Err<OK, ERR> {
        return false;
    }

    ok(): OK {
        return this.value;
    }

    err(): ERR {
        throw new Error('Called `err` on an `Ok` value');
    }

    map<NEW_OK>(fn: (value: OK) => NEW_OK): Result<NEW_OK, ERR> {
        return new Ok(fn(this.value));
    }

    mapErr<NEW_ERR>(fn: (error: ERR) => NEW_ERR): Result<OK, NEW_ERR> {
        return new Ok(this.value);
    }

    andThrough(_: (value: ERR) => void): Result<OK, ERR> {
        return this;
    }

    safeUnwrap(): Generator<Err<never, ERR>, OK> {
        const value = this.value;

        return (function* () {
            return value;
        })();
    }
}

export class Err<OK, ERR> implements Result<OK, ERR> {
    constructor(public error: ERR) {}

    isOk(): this is Ok<OK, ERR> {
        return false;
    }

    isErr(): this is Err<OK, ERR> {
        return true;
    }

    ok(): OK {
        throw new Error('Called `ok` on an `Err` value');
    }

    err(): ERR {
        return this.error;
    }

    map<NEW_OK>(fn: (value: OK) => NEW_OK): Result<NEW_OK, ERR> {
        return new Err(this.error);
    }

    mapErr<NEW_ERR>(fn: (error: ERR) => NEW_ERR): Result<OK, NEW_ERR> {
        return new Err(fn(this.error));
    }

    andThrough(fn: (value: ERR) => void): Result<OK, ERR> {
        fn(this.error);
        return this;
    }

    safeUnwrap(): Generator<Err<never, ERR>, OK> {
        const error = this.error;

        return (function* () {
            yield new Err(error);

            throw new Error('Called `safeUnwrap` on an `Err` value');
        })();
    }
}

export function ok<OK>(value: OK): Ok<OK, never> {
    return new Ok(value);
}

type SpecificString<S extends string> = string extends S ? never : S;

export function err<ERR extends string>(
    error: ERR,
): Err<never, SpecificString<ERR>>;
export function err<ERR>(error: ERR): Err<never, ERR> {
    return new Err(error);
}

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// example usage (sync)

function getMyValue() {
    const n = Math.random();

    if (n > 0.5) {
        return ok(n);
    }

    return err('error' as const);
}

const test = safeTry(function* () {
    const val1 = yield* getMyValue()
        .mapErr((error) => 1 as const)
        .safeUnwrap();

    const val2 = yield* getMyValue()
        .mapErr((error) => 2 as const)
        .safeUnwrap();

    if (Math.abs(val1 - val2) < 0.1) {
        return ok('almost same' as const);
    }

    return ok('different' as const);
}).mapErr((error) => (error === 1 ? 'error 1' : 'error 2'));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// example usage (composition)

function ModifiedValue() {
    return safeTry(function* () {
        const val = yield* getMyValue().safeUnwrap();

        return ok(val + 1);
    });
}

const test2 = safeTry(function* () {
    const val1 = yield* ModifiedValue().safeUnwrap();

    const val2 = yield* ModifiedValue().safeUnwrap();

    if (Math.abs(val1 - val2) < 0.1) {
        return ok('almost same' as const);
    }

    return ok('different' as const);
});
