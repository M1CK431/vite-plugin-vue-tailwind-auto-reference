import { resolve } from "node:path"
import { createFilter, FilterPattern, ResolvedConfig, Plugin } from "vite"


/**
 * A callback that determines whether a file should be skipped by the tailwindAutoReference plugin.
 * 
 * @interface SkipFn
 * @param {string?} code - The content of the file being transformed.
 * @param {string?} id - The unique identifier of the file being transformed.
 * @returns {boolean} - Returns true if the file should be skipped, false otherwise.
 */
interface SkipFn {
  (code?: string, id?: string): boolean
}

/**
 * A callback that determines which "@reference" should be added by the tailwindAutoReference plugin.
 * 
 * @interface CssFileFn
 * @param {string} code - The content of the file being transformed.
 * @param {string} id - The unique identifier of the file being transformed.
 * @returns {Promise<string|Array<string>>|string|Array<string>} - Returns the path to the Tailwind CSS file or an array of them.
 */
interface CssFileFn {
  (code?: string, id?: string): string | string[] | Promise<string | string[]>
}

/**
 * An options object for the tailwindAutoReference plugin.
 * 
 * @interface PluginOption
 * @property {Array<RegExp|string>} [include=[/\.vue\?.*type=style/]] - A list of picomatch patterns that match files to be transformed.
 * @property {Array<RegExp|string>} [exclude=[]] - A list of picomatch patterns that match files to be excluded from transformation.
 * @property {SkipFn} [skip=() => false] -  A function that determines whether a file should be skipped. It takes the code and id as arguments and returns a boolean.
**/
interface PluginOption {
  include?: FilterPattern,
  exclude?: FilterPattern,
  skip: SkipFn,
}


const defaultOpts: PluginOption = {
  include: [/\.vue\?.*type=style/],
  exclude: [],
  skip: () => false
}

const resolveFn = (fn: unknown, ...args: unknown[]) =>
  Promise.resolve(fn instanceof Function ? fn(args) : fn)

/**
 * A Vite plugin that automatically adds "@reference" directives to Vue component style blocks.
 *
 * @function tailwindAutoReference
 * @param {string|string[]|CssFileFn} [cssFile="./src/index.css"] - The path to the Tailwind CSS file or an array of them or a sync or async function that returns it or them.
 * @param {Object} [opts] - An options object.
 * @param {Array<RegExp|string>} [opts.include=[/\.vue/]] - A list of picomatch patterns that match files to be transformed.
 * @param {Array<RegExp|string>} [opts.exclude=[]] - A list of picomatch patterns that match files to be excluded from transformation.
 * @param {SkipFn} [opts.skip] - A function that determines whether a file should be skipped. It takes the code and id as arguments and returns a boolean.
 * @returns {Object} - The plugin configuration object for Vite.
 */
const tailwindAutoReference = (
  cssFile: string | string[] | CssFileFn = "./src/index.css",
  opts = defaultOpts
): Plugin => {
  const { include, exclude, skip } = { ...defaultOpts, ...opts }
  let root: string, fileFilter: (id: string | unknown) => boolean

  const getReferenceStr = (reference: string | string[]) =>
    (Array.isArray(reference) ? reference : [reference]).reduce(
      (acc, file) => `${acc}\n@reference "${resolve(root, file)}";`,
      ""
    )

  return {
    name: "tailwind-auto-reference",
    enforce: "pre",
    configResolved: (config: ResolvedConfig) => {
      root = config.root
      fileFilter = createFilter(include, exclude, { resolve: root })
    },
    transform: async (code: string, id: string) => {
      if (!fileFilter(id)) return code
      if (!code.includes("@apply ") || skip(code, id)) return code

      return `${getReferenceStr(await resolveFn(cssFile, code, id))}${code}`
    }
  }
}

export default tailwindAutoReference
