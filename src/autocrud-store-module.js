
import axios from "axios"
import _ from "lodash"

import ResourceCollection from "./ResourceCollection";
import {registerResourceTypes, getTypeResourceClass} from "./resourceTypes";


/**
 *
 * @param store
 * @param resourceDeclarations - [{key_1: type}, {key_2: type}, ...]
 * @param resourceTypes - resource types definition object, which describes relations
 *   between resources.
 *
 *   Example:
 *
          {

            user: {

                posts: {
                    type: "post",
                    cardinality: "many"
                },

                starredPosts: {
                    type: "post",
                    cardinality: "many"
                }
            },

            post: {

                replies: {
                    type: "comment",
                    cardinality: "many"
                }

            },

            comment: {

            }
        }
 * @param extensionClasses - an object with resource names as properties, mapping to an
 *   object of methods that will be mixed in to instances of the resource type.
 */
export function registerAutoCrudStoreModule(
    store,
    resourceDeclarations,
    resourceTypes,
    extensionClasses = {}
) {

    registerResourceTypes(resourceTypes, extensionClasses)

    // Declare resources (initially undefined)
    let state = {}, getters = {}
    _.keys(resourceDeclarations).forEach(resourceKey => {
        state[resourceKey] = undefined
        getters[resourceKey] = s => {
            return s[resourceKey]
        }
    })

    let mutations = {

        /**
         * Assign new Resource instance to previously declared state property.
         *
         * @param state
         * @param key - the identifier of a state property
         * @param data - resource properties, optionally including expanded relations
         */
        instantiateRootResource(state, {key, data}) {
            const type = resourceDeclarations[key]
            const resourceClass = getTypeResourceClass(type)
            state[key] = new resourceClass(data, {
                type,
                store
            });
        },

        /**
         * Assign new Resource to a given ResourceCollection, as a sub-resource" which
         * is related to a state root-resource either directly or through
         * a chain of ancestors.
         *
         * @param state
         * @param resourceCollection - a ResourceCollection instance
         * @param data - resource properties, optionally including expanded relations
         */
        instantiateCollectionResource(state, {resourceCollection, data}) {
            if (Array.isArray(data)) {
                data.forEach(resourceData => {
                    resourceCollection.instantiateNewResourceItem(resourceData)
                })
            } else {
                resourceCollection.instantiateNewResourceItem(data);
            }
        },

        /**
         * Assign an existing Resource reference to root-resource state property.
         *
         * @param state
         * @param key - the identifier of a state property
         * @param resource - a Resource instance, possibly exposed as a sub-resource of
         *   a different root-resource
         */
        assignRootResource(state, {key, resource}) {
            state[key] = resource
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

        /**
         * Set some subset of the properties on an existing Resource.
         *
         * @param state
         * @param resource
         * @param data
         */
        setResourceData(state, {resource, data}) {
            _.forIn(data, (value, key) => {
                resource[key] = value
            })
        },

        /**
         * Replace all resources data, including properties and related sub-resources.
         *
         */
        setFreshData(state, {resource, freshData}) {
            resource._hydrate(freshData)
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
                    return result.data.id
                });
        },

        bulkCreateResource(context, {resourceCollection, data}) {
            return axios.post(resourceCollection._uri + '-bulk', data)
                .then(result => {
                    context.commit('instantiateCollectionResource', {
                        resourceCollection,
                        data: result.data
                    })
                });
        },

        refreshResource(context, resource) {
            return axios.get(resource._uri)
                .then(result => {
                    context.commit('setFreshData', {
                        resource,
                        freshData: result.data
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

