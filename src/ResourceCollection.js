
import mixinResourceNode from "./resource-node";
import Resource from "./Resource";
import {getTypeResourceClass} from "./resourceTypes";
const _ = require("lodash")

export default class ResourceCollection extends Array {

    /**
     * Construct a collection-resource resource node from raw data.
     *
     * @param collectionData - array of resource data
     * @param nodeOptions - resource-node configuration, specifying resource type,
     *   and relation to parent resource; this node configuration applies to the
     *   collection itself, and every resource it contains
     */
    constructor(collectionData, nodeOptions) {
        super();

        // Superclass will invoke constructor for operations like splice();
        // return unmodified Array instance in those cases
        if(!nodeOptions) {
            return;
        }

        mixinResourceNode(this, nodeOptions)

        this._childNodeOptions = () => {
            return {
                type: nodeOptions.type,
                parent: this,
                store: nodeOptions.store,
                resourceTypes: nodeOptions.resourceTypes
            }
        }

        // Instantiate collection Resource instances from initialization data
        _.forEach(collectionData, resourceData => {
            this.instantiateNewResourceItem(resourceData)
        })
    }


    // GETTERS

    last() {
        return this[this.length - 1]
    }

    firstWhere(values) {
        for (let i = 0; i < this.length; i++) {
            if (_.isMatch(this[i], values)) {
                return this[i]
            }
        }
    }


    // MUTATORS
    // these will invoke underlying Vuex Store mutation

    /**
     * @param data - attributes required to create new resource on the back-end
     * @returns a promise
     */
    create(data) {
        if (Array.isArray(data)) {
            return this._store.dispatch('bulkCreateResource', {resourceCollection: this, data});
        } else {
            return this._store.dispatch('createResource', {resourceCollection: this, data});
        }
    }

    /**
     * @param data - result of create call; original data expanded with 'id' field and
     *   possibly expanded relations.
     * @returns the newly instantiated Resource
     */
    instantiateNewResourceItem(data) {
        const resourceClass = getTypeResourceClass(this._type)
        const newResource = new resourceClass(data, this._childNodeOptions())
        this.push(newResource)
        return newResource
    }

    remove(resource) {
        let i = this.findIndex(e => e === resource)
        if (i !== -1) {
            this.splice(i, 1)
        }
    }



}