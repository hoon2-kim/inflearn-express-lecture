import express from "express";
import database from "./database";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { Controllers } from "./models";
import { options, swaggerDocs } from "./swagger";
import { jwtAuth } from "./middleware";

(async () => {
    const app = express();
    await database.$connect();

    // middleware
    app.use(
        cors({
            origin: "*",
        })
    );
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(jwtAuth);

    // router
    Controllers.forEach((controller) => {
        app.use(controller.path, controller.router);
    });

    // swagger
    app.get("/swagger.json", (req, res) => {
        res.status(200).json(swaggerDocs);
    });
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(undefined, options));

    // Error middleware
    app.use((err, req, res, next) => {
        console.log(err);

        res.status(err.status || 500).json({
            message: err.message || "서버에서 에러가 발생하였습니다.",
        });
    });

    app.listen(8000, () => {
        console.log("서버 시작!");
    });
})();
