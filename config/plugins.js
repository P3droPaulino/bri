/**
 * @software Strapi 4
 * @file ./config/plugins.js
 * @author DanSP <daniel.rootdir@gmail.com>
 * @source Email plugin from ouwn gmai address <https://forum.strapi.io/t/email-plugin-from-own-gmail-address/17625>
 * @source nodemailer from npm <https://www.npmjs.com/package/@strapi/provider-email-nodemailer>
 * @source Cache with REDIS from STRAPI Blog <https://strapi.io/blog/caching-in-strapi-with-rest-cache-plugin>
 * @source Documentation Override Informations <https://docs.strapi.io/dev-docs/plugins/documentation#configuration>
 * @source Documentation Override Routes <https://docs.strapi.io/dev-docs/plugins/documentation#overriding-the-generated-documentation>
 */
module.exports = ({ env }) => ({
  documentation: {
    enabled: true,
    config: {
      openapi: "3.0.1",
      info: {
        version: "1.0.0",
        title: "Mi2 - APP - Documentação",
        description: "Brasil Infinit - Sistema de afiliados",
        termsOfService: "#",
        contact: {
          name: "Pedro Paulino",
          email: "pedropaulinop3@gmail.com",
          url: "https://t.me/Pedro_Paulino"
        },
        license: {
          name: "Apache 2.0",
          url: "https://www.apache.org/licenses/LICENSE-2.0.html"
        },
        "x-generation-date": "2023-02-19T18:47:23.103Z"
      },
      "x-strapi-config": {
        path: "/documentation",
        showGeneratedFiles: true,
        generateDefaultResponse: false,
        plugins: [
          "email",
          "upload",
          "users-permissions"
        ]
      },
      servers: [
        {
          url: "https://api.topinfinit.com.br/api",
          description: "Servidor de produção"
        },
        {
          url: "https://api-dev.topinfinit.com.br/api",
          description: "Servidor de desenvolvimento"
        }
      ],
      externalDocs: {
        description: "Aplicação em produção",
        url: "https://app-bri.pedropaulino.online.online/"
      },
      security: [{ bearerAuth: [] }]
    }
  },
  // Step 1: Configure the redis connection
  // @see https://github.com/strapi-community/strapi-plugin-redis
  redis: {
    config: {
      connections: {
        default: {
          connection: {
            host: '127.0.0.1',
            port: 6379,
            db: 0,
          },
          settings: {
            debug: false,
          },
        },
      },
    },
  },
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '60000s',
      },
    },
  },
  // Step 2: Configure the redis cache plugin
  // "rest-cache": {
  //     config: {
  //         provider: {
  //             name: "redis",
  //             options: {
  //                 max: 32767,
  //                 connection: "default",
  //             },
  //         },
  //         strategy: {

  //             enableEtagSupport: true,
  //             logs: true,
  //             clearRelatedCache: true,
  //             maxAge: 3600000,
  //             contentTypes: [
  //                 // list of Content-Types UID to cache
  //                 "api::product.product",
  //                 // "api::article.article",
  //                 // "api::global.global",
  //                 // "api::homepage.homepage",
  //                 // {
  //                 //     contentType: "api::order.category",
  //                 //     maxAge: 3600000,
  //                 //     hitpass: false,
  //                 //     keys: {
  //                 //         useQueryParams: false,
  //                 //         useHeaders: ["accept-encoding"],
  //                 //     },
  //                 //     maxAge: 18000,
  //                 //     method: "GET",
  //                 // }
  //             ],
  //         },
  //     },
  // },
  // upload: {
  //   config: {
  //     provider: 'local',
  //     providerOptions: {
  //       sizeLimit: 5 * 1024 * 1024,
  //     },
  //   },
  // },
  // plugins: {
  //   // ...
  //   'email-designer': {
  //     enabled: true,
  //     smtp: {
  //       host: 'mail.mercadointeligente.online',
  //       port: 465,
  //       secure: false,
  //       auth: {
  //         user: 'smtp@mercadointeligente.online',
  //         pass: '=8.JeGviBsfl',
  //       },
  //     },
  //   },
  // },
});