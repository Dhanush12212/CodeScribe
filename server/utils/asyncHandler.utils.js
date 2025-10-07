const asyncHandler = (handlerFunction) => {
    return async(req, res, next) => {
        try {
            await handlerFunction(req, res, next);
        } catch(error) {
            console.log("Error caught in asyncHandler: ", error);
            next(error); 
        }
    }
}

export default asyncHandler;