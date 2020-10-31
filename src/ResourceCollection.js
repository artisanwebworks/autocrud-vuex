
import mixinResourceNode from "./resource-node";
import Resource from "./Resource";
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

    // MUTATORS
    // these will invoke underlying Vuex Store mutation

    /**
     * @param data - attributes required to create new resource on the back-end
     * @returns a promise
     */
    create(data) {
        return this._store.dispatch('createResource', {resourceCollection: this, data})
    }

    /**
     * @param data - result of create call; original data expanded with 'id' field and
     *   possibly expanded relations.
     * @returns the newly instantiated Resource
     */
    instantiateNewResourceItem(data) {
        let newResource = new Resource(data, this._childNodeOptions())
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