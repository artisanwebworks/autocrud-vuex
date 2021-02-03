import Resource from "../src/Resource";
import ResourceCollection from "../src/ResourceCollection";
import {userData} from './fixtures/logged-in-user-data'

import resourceTypes from './fixtures/resource-types'
import {registerResourceTypes} from "../src/resourceTypes";
registerResourceTypes(resourceTypes)

describe('resource construction with deep initialization data', () => {

    let user

    beforeAll(() => {
        user = new Resource(userData, {type: 'user'})
    })

    test('user resource filled with attributes from data', () => {
        expect(user.id).toBe(1)
        expect(user.username).toBe('Dave')
    })

    test("user --> post relation is filled", () => {
        expect(user.posts).toBeInstanceOf(ResourceCollection);
        expect(user.posts).toBeInstanceOf(Array);
        expect(user.posts.length).toBe(1);
        let post = user.posts[0];
        expect(post.id).toBe(11);
        expect(post.body).toBe('foo');
    })

    test('user --> post --> replies is filled', () => {
        let replies = user.posts[0].replies;
        expect(replies).toBeInstanceOf(ResourceCollection);
        expect(replies.length).toBe(1)
        expect(replies[0].id).toBe(111)
        expect(replies[0].message).toBe("bar")
    })
})

describe('resource construction with shallow initialization data', () => {

    let user

    beforeAll(() => {

        let userData = {
            id: 1,
            username: 'Dave',
        }

        user = new Resource(userData, {type: 'user'})

    })

    test('user resource filled with attributes from data', () => {
        expect(user.id).toBe(1)
        expect(user.username).toBe('Dave')
    })

    test("user --> post relation exists but is empty", () => {
        expect(user.posts).toBeInstanceOf(ResourceCollection);
        expect(user.posts.length).toBe(0);

    })

})