/**
 * @source Strings de tradução <./node_modules/@strapi/admin/admin/src/translations>
 * @source Configure Options <https://docs.strapi.io/developer-docs/latest/development/admin-customization.html#configuration-options>
*/

// import pkg from "../../package.json";
const config = {
  locales: [
    'pt-BR',
  ],
  translations: {
    en: {
      "app.components.LeftMenu.navbrand.title": "Brasil Infinit",
      "app.components.LeftMenu.navbrand.workplace": "Painel ADMIN",
      "content-type-builder.plugin.name": "DEV API",
      "Auth.form.welcome.subtitle": "Manager your app",
      "Auth.form.welcome.title": "Welcome",
      "app.components.HomePage.welcomeBlock.content.again": "Managing your application just got easier",
      "global.content-manager": "Database",
    },
    "pt-BR": {
      "app.components.LeftMenu.navbrand.title": "Brasil Infinit",
      "app.components.LeftMenu.navbrand.workplace": "Painel ADMIN",
      "content-type-builder.plugin.name": "DEV API",
      "Auth.form.welcome.subtitle": "Gerenciar seu APP",
      "Auth.form.welcome.title": "Bem-vindo(a)!",
      "app.components.HomePage.welcomeBlock.content.again": "A gestão de sua aplicação ficou mais fácil",
      "global.content-manager": "Banco de dados",
      "app.components.ToggleCheckbox.off-label": "Não",
      "app.components.ToggleCheckbox.on-label": "Sim",
      "components.InputSelect.option.placeholder": "-- Escolha --",
    },
  },
  tutorials: false,
  notifications: {
    releases: false
  },
};

const bootstrap = (app) => {
  console.log(app);
};

export default {
  config,
  bootstrap,
};