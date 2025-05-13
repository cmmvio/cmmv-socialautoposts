import * as crypto from "node:crypto";
import { Service } from '@cmmv/core';

import {
    RepositorySchema, Repository
} from "@cmmv/repository";

import {
   IntegrationsServiceGenerated
} from "@generated/services/socialautoposts/integrations.service";

import {
    IntegrationsEntity
} from "@entities/socialautoposts/integrations.entity";

import {
    Integrations
} from "@models/socialautoposts/integrations.model";

@Service("integrations")
export class IntegrationsService extends IntegrationsServiceGenerated {
    protected schema = new RepositorySchema(
        IntegrationsEntity,
        Integrations,
        false,
        true,
        false
    );

    /**
     * Generate state
     * @param accountId
     * @param stateCode
     * @param link
     * @returns
     */
    async generateState(accountId: string, stateCode: string, link: string) {
        const StateEntity = Repository.getEntity("StateEntity");
        const uuid = crypto.randomUUID();
        const state = await Repository.insert(StateEntity, {
            account: accountId,
            uuid: uuid,
            state: stateCode,
            link: link
        });

        if(!state)
            throw new Error("Failed to generate state");

        return `${process.env.FRONTEND_URL}/integrations/redirect?state=${uuid}`;
    }

    /**
     * Get integrations
     * @param accountId
     * @returns
     */
    async getIntegrations(queries: any, accountId: string) {
        const IntegrationsEntity = Repository.getEntity("IntegrationsEntity");

        const integrations = await Repository.findAll(IntegrationsEntity, {
            ...queries,
            account: accountId
        }, [], {
            select: ["id", "name", "pageId", "type", "updatedAt", "image"]
        });

        return integrations;
    }

    /**
     * Redirect to the link
     * @param state
     * @returns
     */
    async redirect(state: string) {
        const StateEntity = Repository.getEntity("StateEntity");
        const result = await Repository.findOne(StateEntity, {
            uuid: state
        });

        if(!result)
            throw new Error("State not found");

        return result.link;
    }

    /**
     * Delete integration
     * @param id
     * @returns
     */
    async deleteIntegration(id: string, accountId: string) {
        const IntegrationEntity = Repository.getEntity("IntegrationsEntity");
        const result = await Repository.deleteMany(IntegrationEntity, {
            id: id,
            account: accountId
        });

        if(!result)
            throw new Error("Failed to delete integration");

        return { success: true };
    }
}