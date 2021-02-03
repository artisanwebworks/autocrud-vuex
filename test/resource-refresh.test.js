
import {createStore} from 'vuex'
import {registerAutoCrudStoreModule} from '../src/autocrud-store-module'

import resourceTypes from './fixtures/resource-types'

import axios from "axios"
jest.mock('axios')

describe('refreshing user resource', () => {

    let _store
    let _user
    let _userData

    beforeAll(() => {

        // Initialize Vue environment with autocrud store module
        // loaded into Vuex
        _store = createStore({})
        registerAutoCrudStoreModule(
            _store,
            {loggedInUser: "user"},
            resourceTypes
        )

        _userData = {
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

        _store.commit('instantiateRootResource', {key: 'loggedInUser', data: _userData})
        _user = _store.state.autocrud.loggedInUser
    })

    test('user altered username property picked up on refresh', () => {

        // Mock a result of user resource 'refresh()' GET call where username has changed
        _userData.username = 'Foo'
        axios.get.mockResolvedValue({
            data: _userData
        });

        return _user.refresh().then( () => {
            expect(_user.username).toBe('Foo')
        })
    })

    test('test user post relation item altered, picked up on refresh', () => {


        // Mock a result of user resource 'refresh()' GET call where post
        // relation item has been altered, but none added or removed
        _userData.posts[0].body = 'altered'
        axios.get.mockResolvedValue({
            data: _userData
        });

        return _user.refresh().then( () => {
            expect(_user.posts[0].body).toBe('altered')
        })

    })

    test('test user post relation new item, picked up on refresh', () => {

        const previousPostsLength = _user.posts.length

        // Mock a result of user resource 'refresh()' GET call where a new item
        // has been added
        _userData.posts.push({id: 15, body: 'new post'})
        axios.get.mockResolvedValue({
            data: _userData
        });

        return _user.refresh().then( () => {
            expect(_user.posts.length).toBe(previousPostsLength + 1)
        })

    })

    test('test user post relation removed item, picked up on refresh', () => {

        const previousPostsLength = _user.posts.length

        // Mock a result of user resource 'refresh()' GET call where a new item
        // has been added
        _userData.posts.pop()
        axios.get.mockResolvedValue({
            data: _userData
        });

        return _user.refresh().then( () => {
            expect(_user.posts.length).toBe(previousPostsLength - 1)
        })

    })
})

