const defaultSwagger = {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "인프런 강의 - Community",
        description: "인프런 강의를 들으며 만드는 커뮤니티",
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
};

export default defaultSwagger;
