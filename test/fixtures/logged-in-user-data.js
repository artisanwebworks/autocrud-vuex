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
        }
    ],

    starred_posts: [
        {id: 1111, post_id: 11}
    ]
}
