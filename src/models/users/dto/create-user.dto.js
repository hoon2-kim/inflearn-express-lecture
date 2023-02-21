export class CreateUserDTO {
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
}
