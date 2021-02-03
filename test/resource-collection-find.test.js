import Resource from "../src/Resource";
import {registerResourceTypes} from "../src/resourceTypes";
import resourceTypes from './fixtures/resource-types'


describe('resource REST endpoint URI generation', () => {

    let user

    beforeAll(() => {

        let userData = {
            id: 1,
            username: 'Dave',
            posts: [
                {
                    id: 11,
                    body: 'foo1',
                },
                {
                    id: 12,
                    body: 'foo2',
                },
                {
                    id: 13,
                    body: 'foo common',
                },
                {
                    id: 14,
                    body: 'foo common',
                }
            ],

            starred_posts: [
                {id: 1111, post_id: 11}
            ]
        }

        registerResourceTypes(resourceTypes)
        user = new Resource(userData, {type: 'user'})

    })

    test('find first post with matching body', () => {
        expect(user.posts.firstWhere({body: 'foo2'}).id).toBe(12)
    })

    test('firstWhere returns undefined if no match', () => {
        expect(user.posts.firstWhere({body: 'foo999'})).toBeUndefined()
    })

    test('find via camel case relation', () => {
        expect(user.starredPosts.firstWhere({post_id: 11}).id).toBe(1111)
    })

})

