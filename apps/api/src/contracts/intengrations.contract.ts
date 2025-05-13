import {
    Contract, AbstractContract,
    ContractField
} from "@cmmv/core";

import {
    AccountsContract
} from "./accounts.contract";

@Contract({
    namespace: 'SocialAutoPosts',
    controllerName: 'Integrations',
    protoPackage: 'socialautoposts',
    subPath: '/socialautoposts',
    auth: true,
    options: {
        moduleContract: true,
        databaseSchemaName: "socialautoposts_integrations",
        databaseTimestamps: true
    }
})
export class IntegrationsContract extends AbstractContract {
    @ContractField({
        protoType: "string",
        objectType: "object",
        entityType: "AccountsEntity",
        nullable: false,
        index: true,
        readOnly: true,
        link: [
            {
                createRelationship: true,
                contract: AccountsContract,
                contractName: 'AccountsContract',
                entityName: 'account',
                field: 'id',
            }
        ]
    })
    account!: string;

    @ContractField({
        protoType: "string",
        nullable: true,
        index: true,
    })
    name?: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    type!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    accessToken!: string;

    @ContractField({
        protoType: "string",
        nullable: true,
        index: true,
    })
    refreshToken?: string;

    @ContractField({
        protoType: "string",
        nullable: true,
        index: true,
    })
    pageId?: string;

    @ContractField({
        protoType: "string",
        nullable: true,
        index: true,
    })
    image?: string;
}
