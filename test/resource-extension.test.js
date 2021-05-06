import Resource from "../src/Resource";
import {userData} from './fixtures/logged-in-user-data'
import extensions from './fixtures/resource-extensions'
import resourceTypes from './fixtures/resource-types'
import {registerResourceTypes} from "../src/resourceTypes";

registerResourceTypes(resourceTypes)

describe('resource construction with deep initialization data', () => {

    let user

    beforeAll(() => {
        user = new Resource(userData, {type: 'user'}, extensions.user)
    })

    test('extension method is exposed', () => {
        expect(user.hasEvenNumberPosts()).toBe(true)
    })

})
