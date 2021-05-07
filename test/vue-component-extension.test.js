import {shallowMount} from '@vue/test-utils'
import {createStore, mapGetters} from 'vuex'
import {registerAutoCrudStoreModule} from '../src/autocrud-store-module'
import resourceTypes from './fixtures/resource-types'
import {userData} from './fixtures/logged-in-user-data'
import resourceExtensions from './fixtures/resource-extensions'

import axios from "axios"
jest.mock('axios')

describe('mixed-in resource extension methods are reactive', () => {

    let store, wrapper

    beforeEach(() => {

        // Initialize Vue environment with autocrud store module
        // loaded into Vuex
        store = createStore({})
        registerAutoCrudStoreModule(
            store,
            {loggedInUser: "user"},
            resourceTypes,
            resourceExtensions
        )

        // First populate the root loggedInUser resource with data
        store.commit('instantiateRootResource', {key: 'loggedInUser', data: userData})

        // Mount a control that utilizes store
        const component = {
            template: '<div>' +
                      '<template v-if="user.hasEvenNumberPosts()">even</template>' +
                      '<template v-else>odd</template>' +
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

    test('adding post changes template component', () => {

        let normalizedActualHtml = () => {
            return wrapper.html().replace(/\s/g,'')
        }

        // First populate the root loggedInUser resource with data;
        // user initially has 2 posts
        store.commit('instantiateRootResource', {key: 'loggedInUser', data: userData})

        // Wait for component to finish rendering in response to user initialization
        return wrapper.vm.$nextTick()
            .then(() => {

                expect(normalizedActualHtml()).toBe(
                    '<div>even<button></button></div>'
                )

                // Trigger a button click which adds a new post
                axios.post.mockResolvedValue({
                    data: {id: 22, body: "other foo"}
                });
                return wrapper.find('button').trigger('click')

            })
            .then( () => {

                expect(normalizedActualHtml()).toBe(
                    '<div>odd<button></button></div>'
                )
            })

    })
})
