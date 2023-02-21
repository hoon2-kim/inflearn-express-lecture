import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export class RegisterDTO {
    name;
    email;
    description;
    password;
    phoneNumber;

    constructor(props) {
        this.name = props.name;
        this.email = props.email;
        this.description = props.description;
        this.password = props.password;
        this.phoneNumber = props.phoneNumber;
    }

    async hashPassword() {
        const hashedPassword = await bcrypt.hash(
            this.password,
            Number(process.env.PASSWORD_SALT)
        );

        return hashedPassword;
    }
}
