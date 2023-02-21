import { Router } from "express";
import { CreateUserDTO, UpdateUserDTO, UsersDTO } from "../dto";
import { UserService } from "../service";
import { pagination } from "../../../middleware/pagination";

class UserController {
    router;
    path = "/users";
    userService;

    constructor() {
        this.router = Router();
        this.userService = new UserService();
        this.init();
    }

    init() {
        this.router.get("/", pagination, this.fetchUsers.bind(this));
        this.router.get("/detail/:id", this.fetchUser.bind(this));
        this.router.post("/", this.createUser.bind(this));
        this.router.patch("/:id", this.updateUser.bind(this));
        this.router.delete("/:id", this.deleteUser.bind(this));
    }

    async fetchUsers(req, res, next) {
        try {
            const { users, count } = await this.userService.findUsers({
                skip: req.skip,
                take: req.take,
            });

            res.status(200).json({
                users: users.map((user) => new UsersDTO(user)),
                count,
            });
            // res.status(200).json({ users, count });
        } catch (err) {
            next(err);
        }
    }

    async fetchUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await this.userService.findUserById(id);

            res.status(200).json({ user: new UsersDTO(user) });
        } catch (err) {
            next(err);
        }
    }

    async createUser(req, res, next) {
        try {
            const createUserDto = new CreateUserDTO(req.body);

            const newUserId = await this.userService.createUser(createUserDto);

            res.status(201).json({ id: newUserId });
        } catch (err) {
            next(err);
        }
    }

    async updateUser(req, res, next) {
        try {
            const { id } = req.params;

            const updateUserDto = new UpdateUserDTO(req.body);

            await this.userService.updateUser({ id, updateUserDto });

            res.status(204).json({});
        } catch (err) {
            next(err);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;

            await this.userService.deleteUser(id);

            res.status(204).json({});
        } catch (err) {
            next(err);
        }
    }
}

const userController = new UserController();
export default userController;
