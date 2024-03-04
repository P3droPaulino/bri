import type { Schema, Attribute } from '@strapi/strapi';

export interface AttributesAttributes extends Schema.Component {
  collectionName: 'components_attributes_attributes';
  info: {
    displayName: 'attributes';
  };
  attributes: {
    name: Attribute.String;
    position: Attribute.Integer;
    visible: Attribute.Boolean;
    variation: Attribute.Boolean;
    options: Attribute.Component<'options.options', true>;
  };
}

export interface AwardAward extends Schema.Component {
  collectionName: 'components_award_awards';
  info: {
    displayName: 'Award';
  };
  attributes: {
    L1: Attribute.Integer;
    L2: Attribute.Integer;
    L3: Attribute.Integer;
    L4: Attribute.Integer;
    L5: Attribute.Integer;
    L6: Attribute.Integer;
    L7: Attribute.Integer;
    L8: Attribute.Integer;
  };
}

export interface ContentContent extends Schema.Component {
  collectionName: 'components_content_contents';
  info: {
    displayName: 'content';
  };
  attributes: {};
}

export interface ConversaConversa extends Schema.Component {
  collectionName: 'components_conversa_conversas';
  info: {
    displayName: 'conversa';
    description: '';
  };
  attributes: {
    users: Attribute.Relation<
      'conversa.conversa',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    conteudo: Attribute.RichText;
  };
}

export interface CrossSellIdsCrossSellIds extends Schema.Component {
  collectionName: 'components_cross_sell_ids_cross_sell_ids';
  info: {
    displayName: 'cross_sell_ids';
  };
  attributes: {
    id_cross_sell: Attribute.String;
  };
}

export interface DefaultAttributesDefaultAttributes extends Schema.Component {
  collectionName: 'components_default_attributes_default_attributes';
  info: {
    displayName: 'default_attributes';
  };
  attributes: {
    id_attribute: Attribute.String;
  };
}

export interface DimensionsDimensions extends Schema.Component {
  collectionName: 'components_dimensions_dimensions';
  info: {
    displayName: 'dimensions';
  };
  attributes: {
    length: Attribute.Float;
    width: Attribute.Float;
    height: Attribute.Float;
  };
}

export interface DownloadsDownloads extends Schema.Component {
  collectionName: 'components_downloads_downloads';
  info: {
    displayName: 'downloads';
    icon: 'arrowDown';
  };
  attributes: {
    file_id: Attribute.String;
  };
}

export interface FactorFactor extends Schema.Component {
  collectionName: 'components_factor_factors';
  info: {
    displayName: 'Factor';
  };
  attributes: {
    L1: Attribute.Integer;
    L2: Attribute.Integer;
    L3: Attribute.Integer;
    L4: Attribute.Integer;
    L5: Attribute.Integer;
    L6: Attribute.Integer;
    L7: Attribute.Integer;
    L8: Attribute.Integer;
  };
}

export interface OptionsOptions extends Schema.Component {
  collectionName: 'components_options_options';
  info: {
    displayName: 'options';
  };
  attributes: {
    id_option: Attribute.String;
  };
}

export interface RelatedIdsRelatedIds extends Schema.Component {
  collectionName: 'components_related_ids_related_ids';
  info: {
    displayName: 'related_ids';
  };
  attributes: {
    id_related: Attribute.String;
  };
}

export interface TagsTags extends Schema.Component {
  collectionName: 'components_tags_tags';
  info: {
    displayName: 'tags';
  };
  attributes: {
    tag_name: Attribute.String;
  };
}

export interface UpsellIdsUpsellIds extends Schema.Component {
  collectionName: 'components_upsell_ids_upsell_ids';
  info: {
    displayName: 'upsell_ids';
  };
  attributes: {
    id_upsell: Attribute.String;
  };
}

export interface VariationsVariations extends Schema.Component {
  collectionName: 'components_variations_variations';
  info: {
    displayName: 'variations';
  };
  attributes: {
    id_variation: Attribute.String;
  };
}

export interface WaitWait extends Schema.Component {
  collectionName: 'components_wait_waits';
  info: {
    displayName: 'Wait';
    description: '';
  };
  attributes: {
    L1: Attribute.Integer;
    L2: Attribute.Integer;
    L3: Attribute.Integer;
    L4: Attribute.Integer;
    L5: Attribute.Integer;
    L6: Attribute.Integer;
    L7: Attribute.Integer;
    L8: Attribute.Integer;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'attributes.attributes': AttributesAttributes;
      'award.award': AwardAward;
      'content.content': ContentContent;
      'conversa.conversa': ConversaConversa;
      'cross-sell-ids.cross-sell-ids': CrossSellIdsCrossSellIds;
      'default-attributes.default-attributes': DefaultAttributesDefaultAttributes;
      'dimensions.dimensions': DimensionsDimensions;
      'downloads.downloads': DownloadsDownloads;
      'factor.factor': FactorFactor;
      'options.options': OptionsOptions;
      'related-ids.related-ids': RelatedIdsRelatedIds;
      'tags.tags': TagsTags;
      'upsell-ids.upsell-ids': UpsellIdsUpsellIds;
      'variations.variations': VariationsVariations;
      'wait.wait': WaitWait;
    }
  }
}
