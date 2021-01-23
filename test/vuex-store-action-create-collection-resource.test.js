import {createStore} from 'vuex'
import {registerAutoCrudStoreModule} from '../src/autocrud-store-module'
import resourceTypes from './fixtures/resource-types'
import {userData} from './fixtures/logged-in-user-data'
import axios from "axios";

jest.mock('axios')

describe('resource creation via store action', () => {

    let user

    beforeAll(() => {

        const store = createStore({})

        registerAutoCrudStoreModule(
            store,
            {loggedInUser: "user"},
            resourceTypes
        )

        // Populate the root loggedInUser resource with data
        store.commit('instantiateRootResource', {key: 'loggedInUser', data: userData})

        user = store.state.autocrud.loggedInUser
    })

    test('creation via resource collection returns id of newly created', () => {
        const message = "new post"
        axios.post.mockResolvedValue({
            data: {id: 222, message}
        });
        return user.posts.create({message}).then(postId => {
            expect(postId).toBe(222);
        })
    })

})

