<h1 align="center">🧩 vite-plugin-vue-tailwind-auto-reference</h1>

<p align="center">
<a href="https://github.com/M1CK431/vite-plugin-vue-tailwind-auto-reference/releases" alt="GitHub release"><img src="https://img.shields.io/github/v/release/M1CK431/vite-plugin-vue-tailwind-auto-reference.svg" ></a>
<a href="LICENSE" alt="License: MIT"><img src="https://img.shields.io/badge/License-MIT-blue"></a>
<a href="https://www.npmjs.com/package/vite-plugin-vue-tailwind-auto-reference" alt="NPM downloads"><img src="https://img.shields.io/npm/dw/vite-plugin-vue-tailwind-auto-reference?color=limegreen" ></a>
</p>

A Vite plugin that **automatically adds `@reference` directive to Vue SFC `<style>` blocks** (if it contains `@apply`). This is done at Vite code transformation step so **nothing will be added in your codebase!** 👻

⚡ This seamless integration allows developers to leverage [Tailwind CSS v4](https://tailwindcss.com/) features while **maintaining compatibility** with their existing codebase, making migration a breeze.

⚡ By automatically handling `@reference` directive, this plugin **ensures consistent styling** across your application as you transition to Tailwind Tailwind CSS v4.

⚡ Whether you're migrating from Tailwind CSS v3 or just starting out with Tailwind CSS v4, this plugin provides an **efficient way to globally manage styles** in your Vue projects.

## Compatibility

This plugin was tested with Node 20+, Vite 6, Vue 3.5 and Tailwind CSS v4.
It might (should) works with older versions too, but it's untested and no support will be provided.

## Installation

You can install the plugin with your preferred package manager, for ex.:

```sh
npm install vite-plugin-vue-tailwind-auto-reference --save-dev
```

or

```sh
yarn add vite-plugin-vue-tailwind-auto-reference --dev
```

or

```sh
pnpm add -D vite-plugin-vue-tailwind-auto-reference
```

## Usage

### Basic Setup

To use the plugin, simply import and register it in your Vite configuration file (`vite.config.js` or `vite.config.ts`).\
By default, the plugin assume your css file is located at `src/index.css`.
If it is located elsewhere, you can specify it using the [`cssFile` option](#advanced-configuration).

⚠️ **It must be registered before `tailwindcss()` official plugin!** ⚠️

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindAutoReference from 'vite-plugin-vue-tailwind-auto-reference';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    vue(),
    tailwindAutoReference(),
    tailwindcss()
  ]
});
```

Then, use `@apply` directive in your Vue component `<style>` block as usual.

```vue
<template>
  <div class="myClass">
    Hello, Tailwind!
  </div>
</template>

<style scoped>
.myClass {
  @apply bg-blue-500 text-white p-4;
}
</style>
```

### Advanced Configuration

The plugin accepts two parameters:
1. `cssFile`: The path to the Tailwind CSS file.
2. `opts`: An options object that allows you to customize its behavior.

#### Parameters details

- **cssFile** (string | string[] | CssFileFn): The path to the Tailwind CSS file or an array of paths.
You can also provide a function that returns the path(s).
The default CSS file is `./src/index.css`.
  
  ```js
  tailwindAutoReference('./src/tailwind.css')
  ```

  or with multiple files:

  ```js
  tailwindAutoReference(['./src/tailwind.css', './src/theme.css'])
  ```

  or using a function:

  ```js
  tailwindAutoReference((_code, id) => {
    // for ex. if you have multiple product in your codebase, each with a dedicated theme
    // id = '/path/to/your/project/src/productA/app.vue'
    const match = id.match(/\/src\/([^/]+)/);
    const commonCSS = './src/tailwind.css';
    return match ? [commonCSS, `./src/${match[1]}-theme.css`] : commonCSS;
  })
  ```

  even `async` function is supported:
   ```js
  tailwindAutoReference(async (_code, id) => {
    // for ex. if you have multiple product in your codebase, each with a dedicated theme
    // id = '/path/to/your/project/src/productA/app.vue'
    const cssFile = [commonCSS];
    const match = id.match(/\/src\/([^/]+)/);

    if (match) await getCSSFromCDN(match[1])
      .then(additionalCSS => cssFile.push(additionalCSS));
    
    return cssFile;
  })
  ```

- **opts.include** (FilterPattern): A list of picomatch patterns that match files to be transformed. The default pattern is `[/\.vue\?.*type=style/]`.

  ```js
  tailwindAutoReference('./src/tailwind.css', {
    include: [/\.vue\?.*type=style/, /\.scss/]
  })
  ```

- **opts.exclude** (FilterPattern): A list of picomatch patterns that match files to be excluded from transformation.

  ```js
  tailwindAutoReference('./src/tailwind.css', {
    exclude: /productB/ // because productB is not using Tailwind CSS
  })
  ```

- **opts.skip** (SkipFn): A function that determines whether a file should be skipped. It takes the code and id as arguments and returns a boolean.

  ```js
  tailwindAutoReference('./src/tailwind.css', {
    // ignore files that already contain '@reference'
    skip: (code, _id) => code.includes('@reference')
  })
  ```

## Example

Here's an example of how you might use this plugin in a Vue project:

```js
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindAutoReference from 'vite-plugin-vue-tailwind-auto-reference';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    vue(),
    tailwindAutoReference('./src/tailwind.css', {
      include: [/\.vue\?.*type=style/],
      exclude: /node_modules/,
      skip: (code, id) => {
        // Skip the file if needed
        return false;
      }
    }),
    tailwindcss()
  ]
});
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions welcome! Feel free to open an issue or submit a pull request if you have any suggestions or improvements.

### Project setup

```sh
pnpm i
```

### Compiles and hot-reloads for development

```sh
pnpm dev
```

### Compiles and minifies for production

```sh
pnpm build
```

### Lints and fixes files

```sh
pnpm lint
```

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md).
By participating in this project you agree to abide by its terms.

## Sponsoring

If you find this project useful, consider sponsoring it on Buy Me a Coffee.
Your support will help me continue building great open-source projects just like this. Thank you! 🙏

<a href="https://www.buymeacoffee.com/m1ck431" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

