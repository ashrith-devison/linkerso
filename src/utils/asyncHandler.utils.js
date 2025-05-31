import { exceptions } from "winston"

const asyncHandler = (request) => async(req, res, next) =>{
    try{
        return await Promise.resolve(request(req, res, next));
    }
    catch(err){
        const errorStack = err.stack ? err.stack.split('\n') : [];
        if (err.statusCode) {
            res.status(err.statusCode).json({
            message: err.message,
            cause: errorStack,
            error: err,
            icon: 'error',
            });
        } else {
            res.status(510).json({
            message: 'Error in Code Base, Programmer Error',
            problem: err.message,
            error: errorStack,
            icon: 'error',
            });
        }
    }
};

export default asyncHandler;