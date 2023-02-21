import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

export class UpdateUserDTO {
    name;
    email;
    description;
    password;
    phoneNumber;

    constructor(user) {
        this.name = user.name;
        this.email = user.email;
        this.description = user.description;
        this.password = user.password;
        this.phoneNumber = user.phoneNumber;
    }

    async updatePassword() {
        this.password = await bcrypt.hash(password, process.env.PASSWORD_SALT);
    }
}
