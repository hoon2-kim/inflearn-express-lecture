export class UsersDTO {
    id;
    email;
    name;
    description;
    phoneNumber;

    constructor(user) {
        this.id = user.id;
        this.email = user.email;
        this.name = user.name;
        this.description = user.description;
        this.phoneNumber = user.phoneNumber;
    }
}
