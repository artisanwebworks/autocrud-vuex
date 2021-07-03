import _ from "lodash"

import mixinResourceNode from "./resource-node"
import ResourceCollection from "./ResourceCollection"
import {getTypeRelations, getTypeResourceClass} from "./resourceTypes";


export default class Resource {

    /**
     * Construct a single-resource resource node from raw data.
     *
     * @param id - resource id
     * @param data - attributes less id, and data to hydrate related resources
     * @param nodeOptions - describes this resource node
     */
    constructor({id, ...data}, nodeOptions) {
        this.id = id;
        mixinResourceNode(this, {id, ...nodeOptions})
        this._relations = getTypeRelations(this._type)
        this._hydrate(data)
    }


    // MUTATORS
    // these will invoke underlying Vuex Store mutation

    update(data) {
        return this._store.dispatch('updateResource', {resource: this, data})
    }

    delete() {
        return this._store.dispatch('deleteResource', this)
    }

    refresh() {
        return this._store.dispatch('refreshResource', this)
    }


    // HELPERS

    _hydrate(data) {

        // Partition data into attributes and relations
        let relationsData = {}
        _.forIn(data, (value, name) => {
            let relationName = toCamel(name)
            if (_.has(this._relations, relationName)) {
                relationsData[relationName] = value
            } else {

                // Set attributes on this object directly
                this[name] = value
            }
        })

        // Create relations, passing initialization data from last step if available
        _.forIn(this._relations, (relationDef, relationName) => {
            let childNodeOptions = {
                type: relationDef.type,
                parent: this,
                name: relationName,
                store: this._store
            }
            data = relationsData[relationName]
            this[relationName] = relationDef.cardinality === 'many' ?
                new ResourceCollection(data, childNodeOptions) :
                new (getTypeResourceClass(relationDef.type))(data, childNodeOptions)
        })
    }

    /**
     * Convenience helper to fetch a root resource registered by the
     * client code in the vuex autocrud store module.
     *
     * @param name
     * @return Resource or subclass
     */
    getRootResource(name) {
        return this._store.state.autocrud[name]
    }

}

const toCamel = (s) => {
    return s.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
};
