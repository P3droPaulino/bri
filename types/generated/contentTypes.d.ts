import type { Schema, Attribute } from '@strapi/strapi';

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    phoneNumber: Attribute.String;
    phoneNumber_2: Attribute.String;
    birthDate: Attribute.Date;
    document_id: Attribute.String;
    gender: Attribute.Enumeration<['Masculino', 'Feminino', 'Outro']>;
    marital_status: Attribute.Enumeration<
      ['Casado', 'Solteiro', 'Divorciado', 'Vi\u00FAvo']
    >;
    motherName: Attribute.String;
    documentNumber: Attribute.String;
    avatar: Attribute.Media;
    fullName: Attribute.String;
    postalCode: Attribute.String;
    street: Attribute.String;
    number: Attribute.String;
    addressComplement: Attribute.String;
    neighborhood: Attribute.String;
    city: Attribute.String;
    state: Attribute.String;
    country: Attribute.String;
    document_issue_uf: Attribute.String;
    usernameParent: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    active: Attribute.Boolean;
    account_status: Attribute.Enumeration<
      ['Pendente', 'An\u00E1lise', 'Pr\u00E9-aprovado', 'Aprovado', 'Cancelado']
    >;
    passwordFinancial: Attribute.String;
    plan_patrocinador: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::plan.plan'
    >;
    plan_indicador: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::plan.plan'
    >;
    clienteCode_asaas: Attribute.String;
    document_issue: Attribute.String;
    document_issue_date: Attribute.Date;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<{
        min: 1;
        max: 50;
      }>;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiAccountAccount extends Schema.CollectionType {
  collectionName: 'accounts';
  info: {
    singularName: 'account';
    pluralName: 'accounts';
    displayName: 'Account';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    document_id_front: Attribute.Media;
    document_id_verse: Attribute.Media;
    document_id_selfie: Attribute.Media;
    branch: Attribute.String;
    account: Attribute.String;
    clienteCode_asaas: Attribute.String;
    user: Attribute.Relation<
      'api::account.account',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::account.account',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::account.account',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiApportionmentApportionment extends Schema.CollectionType {
  collectionName: 'apportionments';
  info: {
    singularName: 'apportionment';
    pluralName: 'apportionments';
    displayName: 'Apportionment';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    rateio: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::apportionment.apportionment',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::apportionment.apportionment',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBalanceBalance extends Schema.CollectionType {
  collectionName: 'balances';
  info: {
    singularName: 'balance';
    pluralName: 'balances';
    displayName: 'Balance';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    balance_available: Attribute.Decimal;
    balance_blocked: Attribute.Decimal;
    users: Attribute.Relation<
      'api::balance.balance',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::balance.balance',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::balance.balance',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBriBri extends Schema.CollectionType {
  collectionName: 'bris';
  info: {
    singularName: 'bri';
    pluralName: 'bris';
    displayName: 'BRI';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Nome: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::bri.bri', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::bri.bri', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiCategoryCategory extends Schema.CollectionType {
  collectionName: 'categories';
  info: {
    singularName: 'category';
    pluralName: 'categories';
    displayName: 'Category';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String & Attribute.Unique;
    products: Attribute.Relation<
      'api::category.category',
      'manyToMany',
      'api::product.product'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiExtractExtract extends Schema.CollectionType {
  collectionName: 'extracts';
  info: {
    singularName: 'extract';
    pluralName: 'extracts';
    displayName: 'Extract';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    data: Attribute.DateTime;
    type: Attribute.Enumeration<
      [
        'Indica\u00E7\u00E3o Direta',
        'Qualifica\u00E7\u00E3o (Fila \u00FAnica)',
        'Rede',
        'Gradua\u00E7\u00E3o',
        'Gratifica\u00E7\u00E3o',
        'Estorno',
        'Assinatura',
        'Ades\u00E3o',
        'Loja Virtual',
        'Saque'
      ]
    >;
    status: Attribute.Enumeration<['Cr\u00E9dito', 'D\u00E9bito']>;
    description: Attribute.String;
    user: Attribute.Relation<
      'api::extract.extract',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    plan: Attribute.Relation<
      'api::extract.extract',
      'oneToOne',
      'api::plan.plan'
    >;
    value: Attribute.Decimal;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::extract.extract',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::extract.extract',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiGraduationGraduation extends Schema.CollectionType {
  collectionName: 'graduations';
  info: {
    singularName: 'graduation';
    pluralName: 'graduations';
    displayName: 'Graduation';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    nome: Attribute.String;
    icon: Attribute.Media;
    vme: Attribute.Integer;
    meta: Attribute.Integer;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::graduation.graduation',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::graduation.graduation',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrderOrder extends Schema.CollectionType {
  collectionName: 'orders';
  info: {
    singularName: 'order';
    pluralName: 'orders';
    displayName: 'Order';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    total: Attribute.Decimal;
    dataCompra: Attribute.DateTime;
    detalhes_pedidos: Attribute.RichText;
    user: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    order_type: Attribute.Enumeration<
      [
        'simple',
        'variation',
        'affiliate',
        'subscription',
        'accession',
        'course'
      ]
    >;
    gateway_cobranca: Attribute.JSON;
    paid: Attribute.Boolean;
    dataPagamento: Attribute.DateTime;
    modoPagamento: Attribute.Enumeration<['saldo', 'bloqueado', 'pix']>;
    gateway_webhook: Attribute.JSON;
    pix_base64: Attribute.JSON;
    rateios_admin: Attribute.JSON;
    rateios_bonus: Attribute.JSON;
    rateios_unilevel: Attribute.JSON;
    product: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'api::product.product'
    >;
    plan_accession: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'api::plan.plan'
    >;
    plan_subscription: Attribute.Relation<
      'api::order.order',
      'manyToOne',
      'api::plan.plan'
    >;
    plan_patrocinador: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'api::plan.plan'
    >;
    plan: Attribute.Relation<'api::order.order', 'oneToOne', 'api::plan.plan'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPlanPlan extends Schema.CollectionType {
  collectionName: 'plans';
  info: {
    singularName: 'plan';
    pluralName: 'plans';
    displayName: 'Plan';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    user: Attribute.Relation<
      'api::plan.plan',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    dataAtivacao: Attribute.DateTime;
    statusAtivacao: Attribute.Boolean;
    patrocinados: Attribute.Relation<
      'api::plan.plan',
      'oneToMany',
      'api::plan.plan'
    >;
    patrocinador: Attribute.Relation<
      'api::plan.plan',
      'manyToOne',
      'api::plan.plan'
    >;
    matriz_patrocinados: Attribute.Relation<
      'api::plan.plan',
      'oneToMany',
      'api::plan.plan'
    >;
    matriz_patrocinador: Attribute.Relation<
      'api::plan.plan',
      'manyToOne',
      'api::plan.plan'
    >;
    name: Attribute.String;
    qualificado: Attribute.Boolean;
    vencimento: Attribute.DateTime;
    orders_subscription: Attribute.Relation<
      'api::plan.plan',
      'oneToMany',
      'api::order.order'
    >;
    order_accession: Attribute.Relation<
      'api::plan.plan',
      'oneToOne',
      'api::order.order'
    >;
    dataQualificacao: Attribute.DateTime;
    graduation: Attribute.Relation<
      'api::plan.plan',
      'oneToOne',
      'api::graduation.graduation'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::plan.plan', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::plan.plan', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiProductProduct extends Schema.CollectionType {
  collectionName: 'products';
  info: {
    singularName: 'product';
    pluralName: 'products';
    displayName: 'Product';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String & Attribute.Required & Attribute.Unique;
    permalink: Attribute.String;
    type: Attribute.Enumeration<
      [
        'simple',
        'variation',
        'affiliate',
        'subscription',
        'accession',
        'plan',
        'course'
      ]
    >;
    status: Attribute.Enumeration<
      [
        'publish',
        'unpublish',
        'future',
        'draft',
        'pending',
        'private',
        'trash',
        'autodraft',
        'inherit'
      ]
    >;
    featured: Attribute.Boolean;
    catalog_visibility: Attribute.Enumeration<
      ['public', 'password', 'private']
    >;
    description: Attribute.RichText;
    short_description: Attribute.RichText;
    sku: Attribute.String;
    price: Attribute.Decimal;
    regular_price: Attribute.Decimal;
    sale_price: Attribute.Decimal;
    date_on_sale_from: Attribute.DateTime;
    date_on_sale_to: Attribute.DateTime;
    price_html: Attribute.RichText;
    on_sale: Attribute.Boolean;
    purchasable: Attribute.Boolean;
    total_sales: Attribute.Integer;
    virtual: Attribute.Boolean;
    downloadable: Attribute.Boolean;
    downloads: Attribute.Component<'downloads.downloads', true>;
    download_limit: Attribute.Integer;
    download_expiry: Attribute.Integer;
    download_type: Attribute.String;
    external_url: Attribute.String;
    button_text: Attribute.String;
    tax_status: Attribute.String;
    tax_class: Attribute.String;
    manage_stock: Attribute.Boolean;
    stock_quantity: Attribute.Integer;
    in_stock: Attribute.Boolean;
    backorders: Attribute.Boolean;
    backorders_allowed: Attribute.Boolean;
    sold_individually: Attribute.Boolean;
    dimensions: Attribute.Component<'dimensions.dimensions'>;
    shipping_required: Attribute.Boolean;
    shipping_taxable: Attribute.Boolean;
    shipping_class: Attribute.String;
    shipping_class_id: Attribute.String;
    reviews_allowed: Attribute.Boolean;
    average_rating: Attribute.Decimal;
    rating_count: Attribute.Integer;
    related_ids: Attribute.Component<'related-ids.related-ids', true>;
    upsell_ids: Attribute.Component<'upsell-ids.upsell-ids', true>;
    cross_sell_ids: Attribute.Component<'cross-sell-ids.cross-sell-ids', true>;
    purchase_note: Attribute.RichText;
    tags: Attribute.Component<'tags.tags', true>;
    attributes: Attribute.Component<'attributes.attributes', true>;
    default_attributes: Attribute.Component<
      'default-attributes.default-attributes',
      true
    >;
    variations: Attribute.Component<'variations.variations', true>;
    image_single: Attribute.Media;
    renewal_time: Attribute.String;
    renewal_type: Attribute.Enumeration<['fixed', 'recurring']>;
    recurrence_time: Attribute.Enumeration<
      ['monthly', 'quarterly', 'semester', 'yearly']
    >;
    rateios_admins: Attribute.JSON;
    rateios_bonus: Attribute.JSON;
    rateios_unilevel: Attribute.JSON;
    categories: Attribute.Relation<
      'api::product.product',
      'manyToMany',
      'api::category.category'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiReportReport extends Schema.CollectionType {
  collectionName: 'reports';
  info: {
    singularName: 'report';
    pluralName: 'reports';
    displayName: 'Reports';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    type: Attribute.Enumeration<
      [
        'Constru\u00E7\u00E3o Fila',
        'Pagamento Fila',
        'Pagamento Gradua\u00E7\u00E3o'
      ]
    >;
    dados: Attribute.JSON;
    date: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::report.report',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::report.report',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSupportMaterialSupportMaterial
  extends Schema.CollectionType {
  collectionName: 'support_materials';
  info: {
    singularName: 'support-material';
    pluralName: 'support-materials';
    displayName: 'Support material';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    creativeName: Attribute.String;
    media_id: Attribute.String;
    media: Attribute.Media;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::support-material.support-material',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::support-material.support-material',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTicketTicket extends Schema.CollectionType {
  collectionName: 'tickets';
  info: {
    singularName: 'ticket';
    pluralName: 'tickets';
    displayName: 'Ticket';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    Titulo: Attribute.String;
    mensagem: Attribute.RichText;
    departamento: Attribute.Enumeration<['Financeiro', 'Atendimento', 'TI']>;
    user: Attribute.Relation<
      'api::ticket.ticket',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    conversa: Attribute.Component<'conversa.conversa', true>;
    status: Attribute.Enumeration<
      [
        'Fechado',
        'Aberto',
        'Cancelado',
        'Em an\u00E1lise',
        'Aguardando Cliente'
      ]
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::ticket.ticket',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::ticket.ticket',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiVmePointVmePoint extends Schema.CollectionType {
  collectionName: 'vme_points';
  info: {
    singularName: 'vme-point';
    pluralName: 'vme-points';
    displayName: 'VME Points';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    quantidadePontos: Attribute.Decimal;
    order: Attribute.Relation<
      'api::vme-point.vme-point',
      'oneToOne',
      'api::order.order'
    >;
    plan_generator: Attribute.Relation<
      'api::vme-point.vme-point',
      'oneToOne',
      'api::plan.plan'
    >;
    plan_team: Attribute.Relation<
      'api::vme-point.vme-point',
      'oneToOne',
      'api::plan.plan'
    >;
    plan_receiver: Attribute.Relation<
      'api::vme-point.vme-point',
      'oneToOne',
      'api::plan.plan'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::vme-point.vme-point',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::vme-point.vme-point',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiWebhookWebhook extends Schema.CollectionType {
  collectionName: 'webhooks';
  info: {
    singularName: 'webhook';
    pluralName: 'webhooks';
    displayName: 'Webhook';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    payload: Attribute.JSON;
    date: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::webhook.webhook',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::webhook.webhook',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiWithdrawWithdraw extends Schema.CollectionType {
  collectionName: 'withdraws';
  info: {
    singularName: 'withdraw';
    pluralName: 'withdraws';
    displayName: 'Withdraw';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    typePix: Attribute.Enumeration<
      ['cpf_cnpj', 'aleatoria', 'email', 'celular']
    >;
    chavePix: Attribute.String;
    aprovado: Attribute.Boolean;
    user: Attribute.Relation<
      'api::withdraw.withdraw',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    dataSolicitacao: Attribute.DateTime;
    dataPagamento: Attribute.DateTime;
    value: Attribute.Decimal;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::withdraw.withdraw',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::withdraw.withdraw',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'plugin::i18n.locale': PluginI18NLocale;
      'api::account.account': ApiAccountAccount;
      'api::apportionment.apportionment': ApiApportionmentApportionment;
      'api::balance.balance': ApiBalanceBalance;
      'api::bri.bri': ApiBriBri;
      'api::category.category': ApiCategoryCategory;
      'api::extract.extract': ApiExtractExtract;
      'api::graduation.graduation': ApiGraduationGraduation;
      'api::order.order': ApiOrderOrder;
      'api::plan.plan': ApiPlanPlan;
      'api::product.product': ApiProductProduct;
      'api::report.report': ApiReportReport;
      'api::support-material.support-material': ApiSupportMaterialSupportMaterial;
      'api::ticket.ticket': ApiTicketTicket;
      'api::vme-point.vme-point': ApiVmePointVmePoint;
      'api::webhook.webhook': ApiWebhookWebhook;
      'api::withdraw.withdraw': ApiWithdrawWithdraw;
    }
  }
}
