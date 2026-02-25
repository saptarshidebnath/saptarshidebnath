export default {
    default: {
        requireModule: ['ts-node/register'],
        formatOptions: {
            snippetInterface: 'async-await'
        },
        require: ['features/support/**/*.ts', 'features/steps/**/*.ts'],
        paths: ['features/**/*.feature'],
        publishQuiet: true
    }
};
