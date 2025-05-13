import * as jwt from 'jsonwebtoken';

import { Config } from '@cmmv/core';

export function Auth(): MethodDecorator {
    return (target, propertyKey: string | symbol, descriptor: any) => {
        const middlewareAuth = async (
            request: any,
            response: any,
            next?: any,
        ) => {
            let token = null;

            if (!token) {
                token =
                    request.req.headers.authorization?.split(' ')[1] || null;

                if (token === 'null' || token === 'undefined') token = null;
            }

            if (!token && request.query.token)
                token = request.query.token;

            if (!token)
                return response.code(401).end('Unauthorized');

            const jwtSecret = Config.get('auth.jwtSecret');

            if (token !== null) {
                jwt.verify(
                    token,
                    jwtSecret,
                    async (err: any, decoded: any) => {
                        if (err || !decoded)
                            return response.code(401).end('Unauthorized');

                        request.user = decoded;
                        next();
                    },
                );
            } else {
                return response.code(401).end('Unauthorized');
            }
        };

        const existingFields =
            Reflect.getMetadata('route_metadata', descriptor.value) || {};

        const newField = existingFields?.middleware
            ? { middleware: [...existingFields?.middleware, middlewareAuth] }
            : { middleware: [middlewareAuth] };

        Reflect.defineMetadata(
            'route_metadata',
            { ...existingFields, ...newField },
            descriptor.value,
        );
    };
}
