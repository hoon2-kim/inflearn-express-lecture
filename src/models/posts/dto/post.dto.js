import { UsersDTO } from "../../users/dto/uesrs.dto";
import { CommentDTO } from "./comment";
import { TagDTO } from "./tag";

export class PostDTO {
    id;
    title;
    content;
    createdAt;
    user;
    comments;
    tags; // 배열
    likeCount;
    isLiked;

    constructor(props, user) {
        this.id = props.id;
        this.title = props.title;
        this.content = props.content;
        this.createdAt = props.createdAt;
        // user,comments,tags는 post쪽이 아니므로 해당 DTO를 불러옴
        this.user = new UsersDTO(props.user);
        this.comments = props.comments.map(
            (comment) =>
                new CommentDTO({
                    id: comment.id,
                    content: comment.content,
                    childComments: comment.childComments,
                    user: comment.user,
                })
        );
        this.tags = props.tags.map(
            (tag) =>
                new TagDTO({
                    id: tag.id,
                    name: tag.name,
                })
        );
        this.likeCount = props.postLikes.length;
        this.isLiked = user
            ? !!props.postLikes.find((like) => like.userId === user.id)
            : false; // 로그인한 유저가 있고 있으면 find해서 똑같은지 검사 / !! 두개면 있는지임, 있으면 true
    }
}
