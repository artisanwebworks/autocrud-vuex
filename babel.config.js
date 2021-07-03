module.exports = {

  presets: [
    [
      // References 'browserslist' property of package.json
      // (recommended best practice alternative to listing in
      // preset options 'target', because other packages
      // may require it).
      "@babel/env"
    ]
  ],

  env: {

    // Specific to when babel operating under 'test' environment (jest)
    test: {
      presets: ["@vue/cli-plugin-babel/preset"]
    }
  }
}
