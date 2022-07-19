module.exports = function (api) {
    return {
      plugins: ['macros'],
      devServer: {
        host: '0.0.0.0',
        allowedHosts: ['localhost', '.gitpod.io'],
      },
    }
  }