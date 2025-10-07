class ApiResponse {
    constructor(statusCode, data = null, message = "Successful") {
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
        this.success = statusCode < 400;
    }
}

export default ApiResponse; 