import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import database from "../database";

export const jwtAuth = async (req, res, next) => {
    try {
        const headers = req.headers;
        const authorization =
            headers["Authorization"] || headers["authorization"];

        if (
            authorization?.includes("Bearer") ||
            authorization?.includes("bearer")
        ) {
            if (typeof authorization === "string") {
                const bearers = authorization.split(" ");

                if (bearers.length === 2 && typeof bearers[1] === "string") {
                    const accessToken = bearers[1];

                    const decodedToken = jwt.verify(
                        accessToken,
                        process.env.JWT_KEY
                    );
                    console.log({ decodedToken });

                    const user = await database.user.findUnique({
                        where: {
                            id: decodedToken.id,
                        },
                    });

                    if (user) {
                        req.user = user;
                        console.log("req.user: ", req.user);
                        next();
                    } else {
                        next({
                            status: 404,
                            message: "유저를 찾을 수 없습니다.",
                        });
                    }
                } else {
                    next({ status: 400, message: "Token이 잘못되었습니다." });
                }
            } else {
                next({ status: 400, message: "Token이 잘못되었습니다." });
            }
        } else {
            next();
        }
    } catch (err) {
        next({ ...err, status: 403 });
    }
};
