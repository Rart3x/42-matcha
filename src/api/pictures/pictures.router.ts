import { NextFunction, Request, Response, Router } from 'express';

import multer from 'multer';
import { unauthorized } from '@api/errors/unauthorized.error';
import { sql } from '@api/connections/database.connection';
import { badRequest } from '@api/errors/bad-request.error';

const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: /* 5MB */ 1024 * 1024 * 5,
    },
});

export const picturesRouter = Router();

async function verifySession(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.['session'] as string | undefined;

    if (!token) {
        const error = unauthorized();
        res.status(error.code).send(error.message);
        return;
    }

    try {
        const [user]: [{ user_id: string }?] = await sql`
            SELECT user_id
            FROM sessions
            WHERE token = ${token}
                AND NOW() < expires_at;
        `;

        if (!user) {
            res.clearCookie('session');
            const error = unauthorized();
            res.status(error.code).send(error.message);
            return;
        }

        (req as any)['user_id'] = user.user_id;

        next();
    } catch {
        const error = unauthorized();
        res.status(error.code).send(error.message);
    }
}

picturesRouter.post(
    '/',
    verifySession,
    upload.array('pictures', 5),
    async (req: Request, res: Response, _: NextFunction) => {
        const principal_user_id = (req as any)['user_id'] as string; // id from the session
        const files = (req.files as Express.Multer.File[]) || [];

        // validate the files
        for (const file of files) {
            console.log('hey');
            if (!/^image\//.test(file.mimetype)) {
                // only images are allowed
                const error = badRequest();

                res.status(error.code).send(error.message);
                return;
            }

            if (file.size > 1024 * 1024 * 5) {
                // images must be less than 5MB
                const error = badRequest();

                res.status(error.code).send(error.message);
                return;
            }

            if (!/\.jpe?g$/.test(file.originalname)) {
                // only jpeg images are allowed
                const error = badRequest();

                res.status(error.code).send(error.message);
                return;
            }
        }

        try {
            await sql.begin(async (sql) => {
                // delete the old pictures
                await sql`
                    DELETE FROM pictures WHERE user_id = ${principal_user_id}; 
                `;

                if (files.length === 0) {
                    // no files were uploaded
                    return;
                }

                // insert the new pictures
                const entries = files.map((file, index) => [
                    principal_user_id,
                    file.path,
                    file.mimetype,
                    index,
                ]);

                await sql`
                    INSERT INTO pictures (user_id, url, mime_type, position)
                    VALUES ${sql(entries)};
                `;
            });

            res.send({ message: 'ok' });
        } catch {
            const error = badRequest();

            res.status(error.code).send(error.message);
        }
    },
);

picturesRouter.get('/by_id/:user_id/:idx', verifySession, async (req, res, _) => {
    const userId = req.params['user_id'] as string; // id from the url
    const idx = req.params['idx'] as string;

    if (!/^\d+$/.test(idx)) {
        // idx must be a number
        const error = badRequest();

        res.status(error.code).send(error.message);
        return;
    }

    const idxNumber = parseInt(idx, 10);

    if (idxNumber < 0 || 4 < idxNumber) {
        // idx must be between 0 and 4
        const error = badRequest();

        res.status(error.code).send(error.message);
        return;
    }

    try {
        const [picture]: [{ url: string; mime_type: string }] = await sql`
            SELECT url, mime_type
            FROM pictures
                INNER JOIN public.users u on u.id = pictures.user_id
            WHERE u.id = ${userId}
                AND position = ${idxNumber};
        `;

        if (!picture) {
            // no picture at this index
            const error = badRequest();

            res.status(error.code).send(error.message);
            return;
        }

        res.sendFile(picture.url, {
            headers: {
                'Content-Type': picture.mime_type,
            },
            root: '.',
        });
    } catch (e) {
        const error = badRequest();

        res.status(error.code).send(error.message);
    }
});

picturesRouter.get('/principal/:idx', verifySession, async (req, res, _) => {
    const userId = (req as any)['user_id'] as string; // id from the session
    const idx = req.params['idx'] as string;

    if (!/^\d+$/.test(idx)) {
        // idx must be a number
        const error = badRequest();

        res.status(error.code).send(error.message);
        return;
    }

    const idxNumber = parseInt(idx, 10);

    if (idxNumber < 0 || 4 < idxNumber) {
        // idx must be between 0 and 4
        const error = badRequest();

        res.status(error.code).send(error.message);
        return;
    }

    try {
        const [picture]: [{ url: string; mime_type: string }] = await sql`
            SELECT url, mime_type
            FROM pictures
                INNER JOIN public.users u on u.id = pictures.user_id
            WHERE u.id = ${userId}
                AND position = ${idxNumber};
        `;

        if (!picture) {
            // no picture at this index
            const error = badRequest();

            res.status(error.code).send(error.message);
            return;
        }

        res.sendFile(picture.url, {
            headers: {
                'Content-Type': picture.mime_type,
            },
            root: '.',
        });
    } catch (e) {
        const error = badRequest();

        res.status(error.code).send(error.message);
    }
});
