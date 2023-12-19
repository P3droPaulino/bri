 const removeDuplicateEndpoints = endpoints => {
    const uniqueEndpoints = {}
  
    endpoints.forEach(endpoint => {
      const { method, path } = endpoint
      const key = `${method}_${path}`
      uniqueEndpoints[key] = endpoint
    })
  
    return Object.values(uniqueEndpoints)
  }
  
  /**
   * Creates a custom router by combining internal routes with extra routes.
   * @param {object} innerRouter - The internal router to be combined.
   * @param {object[]} [extraRoutes=[]] - Extra routes to be added to the router.
   * @returns {object} - Returns an object representing the custom router.
   */
   const customRouter = (innerRouter, extraRoutes = []) => {
    let routes
    let rotas = {
      /**
       * Gets the prefix of the internal router.
       * @returns {string} - The router's prefix.
       */
      get prefix() {
        return innerRouter.prefix
      },
      /**
       * Gets the combined routes from the internal router and extra routes.
       * @returns {object[]} - An array of objects representing the combined routes.
       */
      get routes() {
        if (!routes) routes = innerRouter.routes.concat(extraRoutes)
        let routerClean = removeDuplicateEndpoints(routes);
        // let routerClean = routes
        return routerClean
      }
    }
    console.log("ROTAS", rotas)
    return rotas
  }

  module.exports = {
    removeDuplicateEndpoints,
    customRouter,

  }
  