/**
 * Base error class for api.
 * @note Sent as an error http response to the client.
 */
export class BaseApiError extends Error {
    constructor(
        message: string,
        public readonly code: number,
    ) {
        super(message);
    }

    /**
     * Returns the error as a DTO.
     */
    get asDto() {
        return {
            error: this.message,
        };
    }
}
