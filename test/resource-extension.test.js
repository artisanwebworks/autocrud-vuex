import {userData} from './fixtures/logged-in-user-data'
import extensions from './fixtures/resource-extensions'
import resourceTypes from './fixtures/resource-types'
import {registerResourceTypes} from "../src/resourceTypes";

registerResourceTypes(resourceTypes)

describe('constructed resource includes extensions method', () => {

    let user

    beforeAll(() => {
        user = new extensions.user(userData, {type: 'user'})
    })

    test('extension method is exposed', () => {
        expect(user.hasEvenNumberPosts()).toBe(true)
    })

})
