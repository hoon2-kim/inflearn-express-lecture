export const pagination = (req, res, next) => {
    const page = req.query.page ?? "1";

    const limit = req.query.limit ?? "10";
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    req.take = take;
    req.skip = skip;

    next();
};
