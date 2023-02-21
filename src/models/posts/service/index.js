import database from "../../../database";
import { UserService } from "../../users/service";
import { PostDTO, PostsDTO } from "../dto/index";

export class PostService {
    userService;

    constructor() {
        this.userService = new UserService();
    }

    // seachValue : 검색어
    async getPosts({ skip, take }, searchValue) {
        const posts = await database.post.findMany({
            where: {
                title: {
                    contains: searchValue ?? "", // 포함되어 있는거 부르는거
                },
            },
            include: {
                user: true,
            },
            skip,
            take,
            orderBy: {
                createdAt: "desc",
            },
        });

        const count = await database.post.count({
            where: {
                title: {
                    contains: searchValue, // 검색에 이런 조건을 넣었으면 count에도 넣어줘야함
                },
            },
        });

        return { posts: posts.map((post) => new PostsDTO(post)), count };
    }

    async getPost(id, user) {
        const post = await database.post.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
                comments: {
                    include: {
                        childComments: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                tags: true,
                postLikes: true,
            },
        });

        if (!post) throw { status: 404, message: "게시글을 찾을 수 없습니다." };

        return new PostDTO(post, user);
    }

    //
    // async createPostLike(userId, postId) {
    //     const user = await this.userService.findUserById(userId);

    //     const post = await database.post.findUnique({
    //         where: {
    //             id: postId,
    //         },
    //     });

    //     if (!post) {
    //         throw { status: 404, message: "게시글을 찾을 수 없습니다." };
    //     }

    //     const isLiked = await database.postLike.findUnique({
    //         where: {
    //             userId_postId: {
    //                 userId: user.id,
    //                 postId: post.id,
    //             },
    //         },
    //     });

    //     if (isLiked) return;

    //     await database.postLike.create({
    //         data: {
    //             user: {
    //                 connect: {
    //                     id: userId,
    //                 },
    //             },
    //             post: {
    //                 connect: {
    //                     id: postId,
    //                 },
    //             },
    //         },
    //     });
    // }

    // async deletePostLike(userId, postId) {
    //     const user = await this.userService.findUserById(userId);

    //     const post = await database.post.findUnique({
    //         where: {
    //             id: postId,
    //         },
    //     });

    //     if (!post) {
    //         throw { status: 404, message: "게시글을 찾을 수 없습니다." };
    //     }

    //     const isLiked = await database.postLike.findUnique({
    //         where: {
    //             userId_postId: {
    //                 userId: user.id,
    //                 postId: post.id,
    //             },
    //         },
    //     });

    //     if (!isLiked) return;

    //     await database.postLike.delete({
    //         where: {
    //             userId_postId: {
    //                 userId: user.id,
    //                 postId: post.id,
    //             },
    //         },
    //     });
    // }

    // 좋아요 싫어요를 한꺼번에 구현
    // 프론트한테 isLike라는 상태(목표)를 보내달라고 하기
    async postLike(userId, postId, isLike) {
        const user = await this.userService.findUserById(userId);

        const post = await database.post.findUnique({
            where: {
                id: postId,
            },
        });

        if (!post) {
            throw { status: 404, message: "게시글을 찾을 수 없습니다." };
        }

        const isLiked = await database.postLike.findUnique({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: post.id,
                },
            },
        });

        // 좋아요를 하는 경우(isLike가 false면 로그인한 유저가 해당 게시글에 좋아요 안했다는 상태를 뜻함)
        if (!isLike && !isLiked) {
            await database.postLike.create({
                data: {
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                    post: {
                        connect: {
                            id: postId,
                        },
                    },
                },
            });
        }

        // 좋아요를 지우는 경우
        else if (isLike && isLiked) {
            await database.postLike.delete({
                where: {
                    userId_postId: {
                        userId: user.id,
                        postId: post.id,
                    },
                },
            });
        }
    }

    // props: CreatePostDTO
    async createPost(props) {
        const user = await this.userService.findUserById(props.userId);

        const newPost = await database.post.create({
            data: {
                title: props.title,
                content: props.content,
                // userId 연결
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                tags: {
                    createMany: {
                        data: props.tags.map((tag) => ({ name: tag })), // [{name : "~~"}]
                    },
                },
            },
        });

        return newPost.id;
    }

    // 부모 댓글 생성
    // props : CreateCommentDTO
    async createComment(props) {
        const user = await this.userService.findUserById(props.userId);

        const post = await database.post.findUnique({
            where: {
                id: props.postId,
            },
        });

        if (!post) {
            throw { status: 404, message: "게시글을 찾을 수 없습니다." };
        }

        const newComment = await database.comment.create({
            data: {
                content: props.content,
                post: {
                    connect: {
                        id: post.id,
                    },
                },
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });

        return newComment.id;
    }

    // 자식 댓글 생성
    // props : CreateChildCommentDTO
    async createChildComment(props) {
        const user = await this.userService.findUserById(props.userId);

        const parentComment = await database.comment.findUnique({
            where: {
                id: props.parentCommentId,
            },
        });

        if (!parentComment) {
            throw { status: 404, message: "부모 댓글을 찾을 수 없습니다." };
        }

        const newChildComment = await database.comment.create({
            data: {
                content: props.content,
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                post: {
                    connect: {
                        id: parentComment.postId,
                    },
                },
                parentComment: {
                    connect: {
                        id: parentComment.id,
                    },
                },
            },
        });

        return newChildComment.id;
    }

    // user를 받는 이유는 수정권한이 있는지 확인하기 위해
    async updatePost(postId, props, user) {
        const post = await database.post.findUnique({
            where: {
                id: postId,
            },
        });

        if (!post) {
            throw { status: 404, message: "게시글을 찾을 수 없습니다." };
        }

        if (post.userId !== user.id) {
            throw { status: 403, message: "본인글만 수정이 가능합니다." };
        }

        if (props.tags) {
            // 1) 태그를 모두 삭제하고, 새로 수정한 태그로 교체
            // 2) 기존에 있는 태그에서 중복되는 값만 제외하고 교체
            await database.tag.deleteMany({
                where: {
                    postId: post.id,
                },
            });

            await database.tag.createMany({
                data: props.tags.map((tag) => ({
                    name: tag,
                    postId: post.id,
                })),
            });
        }

        await database.post.update({
            where: {
                id: post.id,
            },
            data: {
                title: props.title,
                content: props.content,
            },
        });
    }

    async updateComment(commentId, props, user) {
        const comment = await database.findUnique({
            where: {
                id: commentId,
            },
        });

        if (!comment) {
            throw { status: 404, message: "댓글을 찾을 수 없습니다." };
        }

        if (comment.userId !== user.id) {
            throw { status: 403, message: "댓글 수정 권한이 없습니다." };
        }

        await database.comment.update({
            where: {
                id: comment.id,
            },
            data: {
                content: props.content,
            },
        });
    }

    async deletePost(postId, user) {
        const post = await database.post.findUnique({
            where: {
                id: postId,
            },
        });

        if (!post) {
            throw { status: 404, message: "게시글을 찾을 수 없습니다." };
        }

        if (post.userId !== user.id) {
            throw { status: 403, message: "삭제 권한이 없습니다." };
        }

        await database.post.delete({
            where: {
                id: post.id,
            },
        });
    }

    async deleteComment(commentId, user) {
        const comment = await database.comment.findUnique({
            where: {
                id: commentId,
            },
        });

        if (!comment) {
            throw { status: 404, message: "댓글을 찾을 수 없습니다." };
        }

        if (comment.userId !== user.id) {
            throw { status: 403, message: "삭제 권한이 없습니다." };
        }

        await database.comment.delete({
            where: {
                id: comment.id,
            },
        });
    }
}
