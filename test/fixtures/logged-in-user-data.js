export let userData = {

    id: 1,

    username: 'Dave',

    posts: [
        {
            id: 11,
            body: 'foo',
            replies: [
                {
                    id: 111,
                    message: 'bar'
                }
            ],
        },
        {
            id: 12,
            body: 'foo2',
            replies: [
                {
                    id: 111,
                    message: 'bar'
                }
            ],
        }
    ],

    starred_posts: [

        {id: 1111, post_id: 11}

    ],

    profile: {
        id: 11111,
        address: "123 bar st"
    }
}
