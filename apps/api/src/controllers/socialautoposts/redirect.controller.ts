import {
    Controller, Param, Get,
    Res
} from "@cmmv/http";

import {
    RedirectService
} from "../../services/socialautoposts/redirect.service";

import {
    Cache
} from "@cmmv/cache";


@Controller('r')
export class RedirectController {
    constructor(
        private readonly redirectService: RedirectService
    ) {}

    @Get(':uuid')
    @Cache("redirect:", {
        ttl: 60 * 60 * 24 * 30
    })
    async redirect(@Param('uuid') uuid: string, @Res() response: any) {
        const originalLink = await this.redirectService.getShortLink(uuid);

        response.res.writeHead(302, {
            'Location': originalLink
        }).end();
    }
}