
import {createStore} from 'vuex'
import {registerAutoCrudStoreModule} from '../src/autocrud-store-module'
import {userData} from "./fixtures/logged-in-user-data"
import resourceTypes from './fixtures/resource-types'

import axios from "axios"
jest.mock('axios')

describe('refreshing user resource', () => {

    let _store
    let _user

    beforeAll(() => {

        // Initialize Vue environment with autocrud store module
        // loaded into Vuex
        _store = createStore({})
        registerAutoCrudStoreModule(
            _store,
            {loggedInUser: "user"},
            resourceTypes
        )

        _store.commit('instantiateRootResource', {key: 'loggedInUser', data: userData})
        _user = _store.state.autocrud.loggedInUser
    })

    test('user altered username property picked up on refresh', () => {

        // Mock a result of user resource 'refresh()' GET call where username has changed
        userData.username = 'Foo'
        axios.get.mockResolvedValue({
            data: userData
        });

        return _user.refresh().then( () => {
            expect(_user.username).toBe('Foo')
        })
    })

    test('test user post relation item altered, picked up on refresh', () => {


        // Mock a result of user resource 'refresh()' GET call where post
        // relation item has been altered, but none added or removed
        userData.posts[0].body = 'altered'
        axios.get.mockResolvedValue({
            data: userData
        });

        return _user.refresh().then( () => {
            expect(_user.posts[0].body).toBe('altered')
        })

    })

    test('test user post relation new item, picked up on refresh', () => {

        const previousPostsLength = _user.posts.length

        // Mock a result of user resource 'refresh()' GET call where a new item
        // has been added
        userData.posts.push({id: 13, body: 'new post'})
        axios.get.mockResolvedValue({
            data: userData
        });

        return _user.refresh().then( () => {
            expect(_user.posts.length).toBe(previousPostsLength + 1)
        })

    })

    test('test user post relation removed item, picked up on refresh', () => {

        const previousPostsLength = _user.posts.length

        // Mock a result of user resource 'refresh()' GET call where a new item
        // has been added
        userData.posts.pop()
        axios.get.mockResolvedValue({
            data: userData
        });

        return _user.refresh().then( () => {
            expect(_user.posts.length).toBe(previousPostsLength - 1)
        })

    })
})

