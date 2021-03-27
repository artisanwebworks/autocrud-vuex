import Resource from "../src/Resource";
import {registerResourceTypes} from "../src/resourceTypes";
import resourceTypes from './fixtures/resource-types'
import {userData} from "./fixtures/logged-in-user-data"

describe('resource REST endpoint URI generation', () => {

    let user

    beforeAll(() => {

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

