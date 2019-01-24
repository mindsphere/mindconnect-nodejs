export const mochaAsync = (fn: any) => {
    return (done: any) => {
        fn.call().then(done, (err: any) => { done(err); });
    };
};

export const sleep = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

