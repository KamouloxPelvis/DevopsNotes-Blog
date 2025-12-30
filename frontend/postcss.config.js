module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    {
      postcssPlugin: 'ignore-webkit-line-clamp-warning',
      Once(root) {
        // Ignore les warnings -webkit-line-clamp
      }
    }
  ]
}
