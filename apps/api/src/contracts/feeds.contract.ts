import {
    Contract, AbstractContract,
    ContractField
} from "@cmmv/core";

import {
    AccountsContract
} from "./accounts.contract";

@Contract({
    namespace: 'SocialAutoPosts',
    controllerName: 'Feeds',
    protoPackage: 'socialautoposts',
    subPath: '/socialautoposts',
    auth: true,
    options: {
        moduleContract: true,
        databaseSchemaName: "socialautoposts_feeds",
        databaseTimestamps: true
    }
})
export class FeedsContract extends AbstractContract {
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
        nullable: false,
        index: true,
    })
    name!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    link!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
        defaultValue: "immediately",
    })
    shareType!: string;

    @ContractField({
        protoType: 'array',
        nullable: true,
        objectType: 'string',
        protoRepeated: true,
    })
    socials?: string[];
}
