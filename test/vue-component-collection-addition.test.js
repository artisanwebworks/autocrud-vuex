import {shallowMount} from '@vue/test-utils'
import {createStore, mapGetters} from 'vuex'
import {registerAutoCrudStoreModule} from '../src/autocrud-store-module'
import resourceTypes from './fixtures/resource-types'
import {userData} from './fixtures/logged-in-user-data'

import axios from "axios"
jest.mock('axios')

describe('crud operations on store ResourceCollection', () => {

    let store, wrapper

    beforeEach(() => {

        // Initialize Vue environment with autocrud store module
        // loaded into Vuex
        store = createStore({})
        registerAutoCrudStoreModule(
            store,
            {loggedInUser: "user"},
            resourceTypes
        )

        // Mount a control that utilizes store
        const component = {
            template: '<div>' +
                      '<ul v-if="user"><li v-for="post in posts">{{post.body}}</li></ul>' +
                      '<button @click="addPost"/>' +
                      '</div>',
            computed: {

                // Map in getter defined dynamically by the auto-crud store module
                ...mapGetters({user: "loggedInUser"}),

                posts() {
                    return this.user.posts
                }
            },
            methods: {
                addPost() {
                    this.user.posts.create({body: "other foo"})
                }
            }
        }
        wrapper = shallowMount(component, {global: {plugins: [store]}})
    })

    test('creation of new ResourceCollection item updates bound component', () => {

        let normalizedActualHtml = () => {
            return wrapper.html().replace(/\s/g,'')
        }

        let formulateExpectedHtml = (inner) => {
            return '<div><ul>' + inner + '</ul><button></button></div>'
        }

        // First populate the root loggedInUser resource with data
        store.commit('fillRootResource', {key: 'loggedInUser', data: userData})

        // Wait for component to finish rendering in response to user initialization
        return wrapper.vm.$nextTick()
            .then(() => {
                expect(normalizedActualHtml()).toBe(formulateExpectedHtml('<li>foo</li>'))

                // Mock the axios post triggered by the subsequent button click
                axios.post.mockResolvedValue({
                    data: {id: 22, body: "other foo"}
                });

                return wrapper.find('button').trigger('click')
            })
            .then( () => {
                expect(wrapper.html()).toBe(formulateExpectedHtml('<li>foo</li><li>other foo</li>'))
            })

    })
})
