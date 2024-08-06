/**
 * ApiValidator type.
 */
export type ApiValidator = {
    name: string;
    message: string;
    validate: (value: string | undefined) => boolean;
};

export type ApiValidationError = {
    name: string;
    message: string;
};

export function validate(
    value: string | undefined,
    validators: ApiValidator[],
): ApiValidationError[] {
    return validators
        .filter((validator) => !validator.validate(value))
        .map((validator) => ({
            name: validator.name,
            message: validator.message,
        }));
}
