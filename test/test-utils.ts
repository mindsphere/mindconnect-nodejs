export const mochaAsync = (fn: any) => {
    return (done: any) => {
        fn.call().then(done, (err: any) => {
            done(err);
        });
    };
};

export const sleep = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

export const errorHelper = async (fn: Function): Promise<boolean> => {
    let errorOccured = false;
    try {
        await fn();
    } catch (err) {
        errorOccured = true;
    }
    return errorOccured;
};
