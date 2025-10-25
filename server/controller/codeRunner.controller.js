import asyncHandler from "../utils/asyncHandler.utils.js";
import ApiError from '../utils/ApiError.utils.js';
import axios from "axios"; 
import { createSubmission, getResult } from "./judge0.js";
  

//POST /api/v1/execute/runCode
const ExecuteCode = asyncHandler(async (req, res) => { 
    const { source_code, language_id, stdin } = req.body; 

    if (!source_code || !language_id) 
        throw new ApiError(400, "Source Code and Language id required"); 

    const sub = await createSubmission({ source_code, language_id, stdin, base64_encoded:false }); 
    if (!sub || !sub.token) {
        throw new Error("Submission did not return a token");
    }

    return res.json({ token: sub.token }); 

});

//GET /api/v1/execute/result/:token
const CodeOutput = asyncHandler(async(req, res) => {
    const token = req.params.token;

    if(!token)
        throw new ApiError(400, "Token is required");

    const result = await getResult(token, { base64_encoded:false }); 
    return res.json(result);
})

export { ExecuteCode, CodeOutput };
