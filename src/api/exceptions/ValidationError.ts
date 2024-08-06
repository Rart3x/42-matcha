export class ValidationError extends Error {
    constructor(message?: string) {
        super();
        this.name = 'Validation';
        this.message = message || 'Validation error';
    }
}
