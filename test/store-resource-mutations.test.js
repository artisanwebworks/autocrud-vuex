import {shallowMount} from '@vue/test-utils'
import {createStore, mapGetters} from 'vuex'
import {registerAutoCrudStoreModule} from '../src/autocrud-store-module'
import {userData} from './fixtures/logged-in-user-data'

import resourceTypes from './fixtures/resource-types'

describe('store module tests', () => {

    let store, wrapper

    beforeEach(() => {

        // Initialize Vue environment with autocrud store module
        // loaded into Vuex
        store = createStore({})
        registerAutoCrudStoreModule(
            store,
            {loggedInUser: "user", twin: "user"},
            resourceTypes
        )

        // Mount a control that utilizes store
        const component = {
            template: '<div>{{user? user.id : ""}}</div>',
            computed: {

                // Map in getter defined dynamically by the auto-crud store module
                ...mapGetters({user: "loggedInUser", twin: "twin"})
            }
        }
        wrapper = shallowMount(component, {
            global: {
                plugins: [store]
            }
        })
    })

    test('instantiateRootResource mutator assigns new Resource to state', () => {
        expect(store.state.autocrud.loggedInUser).toBeUndefined()
        store.commit('instantiateRootResource', {key: 'loggedInUser', data: userData})
        expect(store.state.autocrud.loggedInUser?.id).toBe(1)
    })

    test('component re-renders when mapped getter changes', () => {
        expect(wrapper.html()).toBe('<div></div>')
        store.commit('instantiateRootResource', {key: 'loggedInUser', data: userData})
        return wrapper.vm.$nextTick().then(() => {
            expect(wrapper.html()).toBe('<div>1</div>')
        })
    })

    test('removeResource mutation updates store state', () => {
        store.commit('instantiateRootResource', {key: 'loggedInUser', data: userData})
        let post = store.state.autocrud.loggedInUser.posts.last()
        expect(post.id).toBe(12)
        store.commit('removeResource', post)
        expect(store.state.autocrud.loggedInUser.posts.length).toBe(1)
    })

    test('setResourceData mutation updates store state', () => {
        store.commit('instantiateRootResource', {key: 'loggedInUser', data: userData})
        let post = store.state.autocrud.loggedInUser.posts.last()
        expect(post.body).toBe("foo2")
        store.commit('setResourceData', {resource: post, data: {body: 'updated foo'}})
        expect(store.state.autocrud.loggedInUser.posts.last().body).toBe('updated foo')
    })

    test('assignRootResource mutation updates store state', () => {
        store.commit('instantiateRootResource', {key: 'loggedInUser', data: userData})
        let user  = store.state.autocrud.loggedInUser
        store.commit('assignRootResource', {key: 'twin', resource: user})
        expect(store.state.autocrud.twin.username).toBe('Dave')
    })
})
