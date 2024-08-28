import {
    authorizedProcedure,
    badRequestResponse,
    successResponse,
    unauthorizedProcedure,
    unauthorizedResponse,
} from '@api/lib/procedure';

export const greetingProcedure = unauthorizedProcedure(
    'greeting',
    async ({ data }: { data: string }) => {
        return successResponse({ greeting: `Hello, ${data}!` });
    },
);

export const helloProcedure = unauthorizedProcedure(
    'hello',
    async ({ name }: { name: string }) => {
        if (name === 'world') {
            return badRequestResponse('Name cannot be "world"');
        }

        return successResponse({ greeting: `Hello, ${name}!` });
    },
);

export const goodbyeProcedure = authorizedProcedure(
    'goodbye',
    async ({ name }: { name: string }, ctx) => {
        if (!ctx.userId) {
            return unauthorizedResponse('Not logged in');
        }

        return successResponse({ greeting: `Goodbye, ${name}!` });
    },
);
