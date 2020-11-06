import {createStore} from 'vuex'
import {registerAutoCrudStoreModule} from '../src/autocrud-store-module'
import resourceTypes from './fixtures/resource-types'
import axios from "axios";

describe('store module tests', () => {

    let store

    beforeEach(() => {

        // Initialize Vue environment with autocrud store module
        // loaded into Vuex
        store = createStore({})
        registerAutoCrudStoreModule(
            store,
            {loggedInUser: "user"},
            resourceTypes
        )
    })

    test('refresh an undefined root resource', () => {

        // Mock the axios post triggered by the store action
        axios.get.mockResolvedValue({
            data: {id: 1, username: "foo"}
        });

        return store.dispatch('refreshResource', 'loggedInUser')
            .then(() => {
                expect(store.state.autocrud.loggedInUser.username).toBe("foo")
            })
    })

})
