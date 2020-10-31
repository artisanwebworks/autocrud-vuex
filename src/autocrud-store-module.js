import Resource from "./Resource"
import ResourceCollection from "./ResourceCollection";
const _ = require("lodash")
import axios from "axios"

/**
 *
 * @param store
 * @param resourceDeclarations - [{key_1: type}, {key_2: type}, ...]
 */
export function registerAutoCrudStoreModule(store, resourceDeclarations, resourceTypes) {

    // Declare a state property for each resource declaration
    // (initially undefined)
    let state = {}, getters = {}
    _.keys(resourceDeclarations).forEach(resourceKey => {
        state[resourceKey] = undefined
        getters[resourceKey] = s => {
            return s[resourceKey]
        }
    })

    let mutations = {

        fillRootResource(state, {key, data}) {
            state[key] = new Resource(data, {
                type: resourceDeclarations[key],
                resourceTypes,
                store
            });
        },
        
        instantiateCollectionResource(state, {resourceCollection, data}) {
            resourceCollection.instantiateNewResourceItem(data);
        },

        removeResource(state, resource) {
            if (!resource._parent) {

                // Resource is store root resource; find state property referencing
                // this resource and unset
                _.forIn(state, (value, key) => {
                    if (value === resource) {
                        state[key] = undefined
                    }
                })

            }
            if (resource._parent instanceof ResourceCollection) {

                resource._parent.remove(resource)

            } else {

                // Parent is Resource with has-one relation to deletion-resource
                resource._parent[resource._name] = undefined
            }
        },

        setResourceData(state, {resource, data}) {
            _.forIn(data, (value, key) => {
                resource[key] = value
            })
        }
    }

    let actions = {

        createResource(context, {resourceCollection, data}) {
            return axios.post(resourceCollection._uri, data)
                .then(result => {
                    context.commit('instantiateCollectionResource', {
                        resourceCollection,
                        data: result.data
                    })
                });
        },

        updateResource(context, {resource, data}) {
            return axios.patch(resource._uri, data)
                .then(result => {

                    // The API returns the entire object; filter down
                    // to only the updated fields
                    let resultData = _.pick(result.data, _.keys(data))

                    context.commit('setResourceData', {
                        resource,
                        data: resultData
                    })
                });
        },

        deleteResource(context, resource) {
            return axios.delete(resource._uri)
                .then( () => {
                    context.commit('removeResource', resource)
                });
        }

    }

    store.registerModule('autocrud', {
        state: () => (state),
        mutations,
        getters,
        actions
    });

}

