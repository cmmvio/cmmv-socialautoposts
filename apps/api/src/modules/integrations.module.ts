import { Module } from '@cmmv/core';

import { FacebookService } from "../services/integrations/facebook.service";
import { FacebookController } from "../controllers/integrations/facebook.controller";

import { InstagramService } from "../services/integrations/instagram.service";
import { InstagramController } from "../controllers/integrations/instagram.controller";

import { TwitterService } from "../services/integrations/twitter.service";
import { TwitterController } from "../controllers/integrations/twitter.controller";

export const IntegrationsModule = new Module('integrations', {
    providers: [FacebookService, InstagramService, TwitterService],
    controllers: [FacebookController, InstagramController, TwitterController]
});
