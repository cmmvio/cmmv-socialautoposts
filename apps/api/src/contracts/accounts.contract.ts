import {
    Contract,
    AbstractContract,
    ContractField,
} from "@cmmv/core";

@Contract({
    namespace: "SocialAutoPosts",
    controllerName: "Accounts",
    protoPackage: "socialautoposts",
    subPath: "/socialautoposts",
    auth: true,
    options: {
        moduleContract: true,
        databaseSchemaName: "socialautoposts_accounts",
        databaseTimestamps: true,
    },
    index: [
        {
            name: "login_email_password",
            fields: ["email", "password"],
        },
        {
            name: "login_username_password",
            fields: ["username", "password"],
        },
    ]
})
export class AccountsContract extends AbstractContract {
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
    email!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    username!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    password!: string;

    @ContractField({
        protoType: "string",
        nullable: true,
    })
    avatar!: string;

    @ContractField({
        protoType: "string",
        nullable: true,
    })
    provider!: string;

    @ContractField({
        protoType: "string",
        nullable: true,
    })
    providerUserId!: string;

    @ContractField({
        protoType: "text",
        nullable: true,
    })
    profile!: string;

    @ContractField({
        protoType: "string",
        nullable: true,
        defaultValue: "user"
    })
    level!: string;
}
