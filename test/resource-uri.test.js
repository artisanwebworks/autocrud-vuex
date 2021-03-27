import Resource from "../src/Resource";
import resourceTypes from './fixtures/resource-types'
import {registerResourceTypes} from "../src/resourceTypes";
registerResourceTypes(resourceTypes)
import {userData} from './fixtures/logged-in-user-data'

describe('resource REST endpoint URI generation', () => {

    let user

    beforeAll(() => {
        user = new Resource(userData, {type: 'user'})
    })

    test('user route', () => {
        expect(user._uri).toBe(uri('api/user/1'))
    })

    test('user --> all-posts route', () => {
        expect(user.posts._uri).toBe(uri('api/user/1/posts'))
    })

    test('user --> single-posts route', () => {
        expect(user.posts[0]._uri).toBe(uri('api/user/1/posts/11'))
    })

    test('user --> post --> all replies', () => {
      expect(user.posts[0].replies._uri).toBe(uri('api/user/1/posts/11/replies'))
    })

    test('user --> post --> single reply', () => {
        expect(user.posts[0].replies[0]._uri).toBe(uri('api/user/1/posts/11/replies/111'))
    })

    test('user --> profile', () => {
        expect(user.profile._uri).toBe(uri('api/user/1/profile'))
    })
})

function uri(path) {
    return location.origin + '/' + path
}