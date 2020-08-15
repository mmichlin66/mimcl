const dev_ifdefLoaderOptions = { DEBUG: true };
const prod_ifdefLoaderOptions = { DEBUG: false };



function config( outFileName, mode, devtool, ifdefLoaderOptions)
{
    return {
        entry: "./lib/index.js",

        output:
        {
            filename: outFileName,
            path: __dirname + "/lib",
            library: 'mimcl',
            libraryTarget: 'umd',
            globalObject: 'this'
        },

        mode: mode,
        devtool: devtool,
        resolve: { extensions: [".js"] },

        module:
        {
            rules:
            [
                { test: /\.js$/, use: [{ loader: "ifdef-loader", options: ifdefLoaderOptions }] },
                { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
            ]
        },

        externals:
        {
            mimcss: { root: 'mimcss', commonjs2: 'mimcss', commonjs: 'mimcss', amd: 'mimcss' },
            mimbl: { root: 'mimbl', commonjs2: 'mimbl', commonjs: 'mimbl', amd: 'mimbl' },
            mimurl: { root: 'mimurl', commonjs2: 'mimurl', commonjs: 'mimurl', amd: 'mimurl' }
        }
    }
}



module.exports =
[
    config( "mimcl.dev.js", "development", "#inline-source-map", dev_ifdefLoaderOptions),
    config( "mimcl.js", "production", undefined, prod_ifdefLoaderOptions),
];



