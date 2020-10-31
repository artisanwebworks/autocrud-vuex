
import mixinResourceNode from "./resource-node"
import ResourceCollection from "./ResourceCollection"
const _ = require("lodash")

export default class Resource {

    /**
     * Construct a single-resource resource node from raw data.
     *
     * @param id - resource id
     * @param data - attributes and data for related resources
     * @param nodeOptions - describes this resource node
     */
    constructor({id, ...data}, nodeOptions) {

        this.id = id;
        mixinResourceNode(this, {id, ...nodeOptions})

        let relations = nodeOptions.resourceTypes[nodeOptions.type];

        // Partition data into attributes and relations
        let relationsData = {}
        _.forIn(data, (value, name) => {
            if (_.has(relations, name)) {
                relationsData[name] = value
            } else {

                // Set attributes on this object directly
                this[name] = value
            }
        })

        // Create relations, passing initialization data from last step if available
        _.forIn(relations, (relationDef, relationName) => {
            let childNodeOptions = {
                type: relationDef.type,
                parent: this,
                name: relationName,
                store: nodeOptions.store,
                resourceTypes: nodeOptions.resourceTypes
            }
            data = relationsData[relationName]
            this[relationName] = relationDef.cardinality === 'many' ?
                new ResourceCollection(data, childNodeOptions) :
                new Resource(data, childNodeOptions)
        })
    }


    // MUTATORS
    // these will invoke underlying Vuex Store mutation

    update(data) {
        return this._store.dispatch('updateResource', {resource: this, data})
    }

    delete() {
        return this._store.dispatch('deleteResource', this)
    }

}

