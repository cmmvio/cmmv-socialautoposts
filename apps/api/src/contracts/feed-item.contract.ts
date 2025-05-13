import {
    Contract, AbstractContract,
    ContractField, ContractMessage,
    ContractService
} from "@cmmv/core";

import {
    AccountsContract
} from "./accounts.contract";

import {
    FeedsContract
} from "./feeds.contract";

@Contract({
    namespace: 'SocialAutoPosts',
    controllerName: 'FeedsItems',
    protoPackage: 'socialautoposts',
    subPath: '/socialautoposts',
    auth: true,
    options: {
        moduleContract: true,
        databaseSchemaName: "socialautoposts_feed_items",
        databaseTimestamps: true
    }
})
export class FeedItemContract extends AbstractContract {
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
        objectType: 'object',
        entityType: 'FeedsEntity',
        nullable: false,
        index: true,
        readOnly: true,
        link: [
            {
                createRelationship: true,
                contract: FeedsContract,
                contractName: 'FeedsContract',
                entityName: 'feed',
                field: 'id',
            }
        ]
    })
    feed!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    title!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    description!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    image!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
        unique: true
    })
    link!: string;

    @ContractField({
        protoType: "datetime",
        nullable: false,
        index: true,
    })
    pubDate!: Date;

    @ContractField({
        protoType: "boolean",
        nullable: false,
        index: true,
        defaultValue: false,
    })
    processed!: boolean;

    @ContractField({
        protoType: "datetime",
        nullable: true,
        index: true,
    })
    processedAt!: Date;

    @ContractField({
        protoType: 'array',
        nullable: true,
        objectType: 'string',
        protoRepeated: true,
    })
    socials?: string[];
}
