import {
    Controller, User, Get,
    Queries, Query, Res,
    Delete, Param
} from "@cmmv/http";

import {
    IntegrationsControllerGenerated
} from "@generated/controllers/socialautoposts/integrations.controller";

import {
    IntegrationsService
} from "@services/socialautoposts/integrations.service";

import {
    Auth
} from "../../decorators/auth.decorator";

@Controller('integrations')
export class IntegrationsController extends IntegrationsControllerGenerated {
    constructor(
        private readonly service: IntegrationsService
    ) { super(service); }

    @Get()
    @Auth()
    async getIntegrations(@Queries() queries: any, @User() user: any) {
        return await this.service.getIntegrations(queries, user.id);
    }

    @Get('redirect')
    async redirect(@Query('state') state: string, @Res() response: any) {
        const redirectLink = await this.service.redirect(state);

        response.res.writeHead(302, {
            'Location': redirectLink
        }).end();
    }

    @Delete(':id')
    @Auth()
    async deleteIntegration(@Param('id') id: string, @User() user: any) {
        return await this.service.deleteIntegration(id, user.id);
    }
}