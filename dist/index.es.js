import axios from 'axios';

/**
 *
 * @param instance - a Resource or ResourceCollection.
 * @param type - string resource name which maps to a root property in 'resource-relation-tree.js'
 * @param id - resource id if this isn't a ResourceCollection
 * @param name - name used in formulation of HTTP route; omitted if id is defined
 * @param parent - a reference to parent Resource or ResourceCollection.
 * @param store
 */
var mixinResourceNode = ((instance, {
  type,
  name,
  parent,
  store
}) => {
  instance._type = type;
  instance._parent = parent;
  instance._name = name;
  instance._store = store;
  instance._uri = deriveResourceUri(instance);
});

function deriveResourceUri(instance) {
  let uriComponents = [];

  for (let node = instance; node; node = node._parent) {
    var _node$_name;

    // If a node is unnamed, it should be identified by id in the URI
    uriComponents.unshift((_node$_name = node._name) !== null && _node$_name !== void 0 ? _node$_name : node.id); // The root node is represented in the URI by its type string

    if (!node._parent) {
      uriComponents.unshift(node._type);
    }
  } // Add URI prefix


  uriComponents.unshift('api');
  return location.origin + '/' + uriComponents.join('/').toLowerCase();
}

const _$2 = require('lodash');
class Resource {
  /**
   * Construct a single-resource resource node from raw data.
   *
   * @param id - resource id
   * @param data - attributes less id, and data to hydrate related resources
   * @param nodeOptions - describes this resource node
   */
  constructor({
    id,
    ...data
  }, nodeOptions) {
    this.id = id;
    mixinResourceNode(this, {
      id,
      ...nodeOptions
    });
    this._relations = getTypeRelations(this._type);

    this._hydrate(data);
  } // MUTATORS
  // these will invoke underlying Vuex Store mutation


  update(data) {
    return this._store.dispatch('updateResource', {
      resource: this,
      data
    });
  }

  delete() {
    return this._store.dispatch('deleteResource', this);
  }

  refresh() {
    return this._store.dispatch('refreshResource', this);
  } // HELPERS


  _hydrate(data) {
    // Partition data into attributes and relations
    let relationsData = {};

    _$2.forIn(data, (value, name) => {
      let relationName = toCamel(name);

      if (_$2.has(this._relations, relationName)) {
        relationsData[relationName] = value;
      } else {
        // Set attributes on this object directly
        this[name] = value;
      }
    }); // Create relations, passing initialization data from last step if available


    _$2.forIn(this._relations, (relationDef, relationName) => {
      let childNodeOptions = {
        type: relationDef.type,
        parent: this,
        name: relationName,
        store: this._store
      };
      data = relationsData[relationName];
      this[relationName] = relationDef.cardinality === 'many' ? new ResourceCollection(data, childNodeOptions) : new (getTypeResourceClass(relationDef.type))(data, childNodeOptions);
    });
  }
  /**
   * Convenience helper to fetch a root resource registered by the
   * client code in the vuex autocrud store module.
   *
   * @param name
   * @return Resource or subclass
   */


  getRootResource(name) {
    return this._store.state.autocrud[name];
  }

}

const toCamel = s => {
  return s.replace(/([-_][a-z])/ig, $1 => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
};

let _relations;

let _extensionClasses;

function registerResourceTypes(relations, extensionClasses = {}) {
  _relations = relations;
  _extensionClasses = extensionClasses;
}
function getTypeRelations(type) {
  return _relations[type];
}
/**
 * Return the class type of instances of the given resource type,
 * which will be Resource or an optional subclass of Resource.
 *
 * @param type
 * @returns {Resource}
 */

function getTypeResourceClass(type) {
  var _extensionClasses$typ;

  return (_extensionClasses$typ = _extensionClasses[type]) !== null && _extensionClasses$typ !== void 0 ? _extensionClasses$typ : Resource;
}

const _$1 = require('lodash');
class ResourceCollection extends Array {
  /**
   * Construct a collection-resource resource node from raw data.
   *
   * @param collectionData - array of resource data
   * @param nodeOptions - resource-node configuration, specifying resource type,
   *   and relation to parent resource; this node configuration applies to the
   *   collection itself, and every resource it contains
   */
  constructor(collectionData, nodeOptions) {
    super(); // Superclass will invoke constructor for operations like splice();
    // return unmodified Array instance in those cases

    if (!nodeOptions) {
      return;
    }

    mixinResourceNode(this, nodeOptions);

    this._childNodeOptions = () => {
      return {
        type: nodeOptions.type,
        parent: this,
        store: nodeOptions.store,
        resourceTypes: nodeOptions.resourceTypes
      };
    }; // Instantiate collection Resource instances from initialization data


    _$1.forEach(collectionData, resourceData => {
      this.instantiateNewResourceItem(resourceData);
    });
  } // GETTERS


  last() {
    return this[this.length - 1];
  }

  firstWhere(values) {
    for (let i = 0; i < this.length; i++) {
      if (_$1.isMatch(this[i], values)) {
        return this[i];
      }
    }
  } // MUTATORS
  // these will invoke underlying Vuex Store mutation

  /**
   * @param data - attributes required to create new resource on the back-end
   * @returns a promise
   */


  create(data) {
    if (Array.isArray(data)) {
      return this._store.dispatch('bulkCreateResource', {
        resourceCollection: this,
        data
      });
    } else {
      return this._store.dispatch('createResource', {
        resourceCollection: this,
        data
      });
    }
  }
  /**
   * @param data - result of create call; original data expanded with 'id' field and
   *   possibly expanded relations.
   * @returns the newly instantiated Resource
   */


  instantiateNewResourceItem(data) {
    const resourceClass = getTypeResourceClass(this._type);
    const newResource = new resourceClass(data, this._childNodeOptions());
    this.push(newResource);
    return newResource;
  }

  remove(resource) {
    let i = this.findIndex(e => e === resource);

    if (i !== -1) {
      this.splice(i, 1);
    }
  }

}

const _ = require('lodash');
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

function registerAutoCrudStoreModule(store, resourceDeclarations, resourceTypes, extensionClasses = {}) {
  registerResourceTypes(resourceTypes, extensionClasses); // Declare resources (initially undefined)

  let state = {},
      getters = {};

  _.keys(resourceDeclarations).forEach(resourceKey => {
    state[resourceKey] = undefined;

    getters[resourceKey] = s => {
      return s[resourceKey];
    };
  });

  let mutations = {
    /**
     * Assign new Resource instance to previously declared state property.
     *
     * @param state
     * @param key - the identifier of a state property
     * @param data - resource properties, optionally including expanded relations
     */
    instantiateRootResource(state, {
      key,
      data
    }) {
      const type = resourceDeclarations[key];
      const resourceClass = getTypeResourceClass(type);
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
    instantiateCollectionResource(state, {
      resourceCollection,
      data
    }) {
      if (Array.isArray(data)) {
        data.forEach(resourceData => {
          resourceCollection.instantiateNewResourceItem(resourceData);
        });
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
    assignRootResource(state, {
      key,
      resource
    }) {
      state[key] = resource;
    },

    removeResource(state, resource) {
      if (!resource._parent) {
        // Resource is store root resource; find state property referencing
        // this resource and unset
        _.forIn(state, (value, key) => {
          if (value === resource) {
            state[key] = undefined;
          }
        });
      }

      if (resource._parent instanceof ResourceCollection) {
        resource._parent.remove(resource);
      } else {
        // Parent is Resource with has-one relation to deletion-resource
        resource._parent[resource._name] = undefined;
      }
    },

    /**
     * Set some subset of the properties on an existing Resource.
     *
     * @param state
     * @param resource
     * @param data
     */
    setResourceData(state, {
      resource,
      data
    }) {
      _.forIn(data, (value, key) => {
        resource[key] = value;
      });
    },

    /**
     * Replace all resources data, including properties and related sub-resources.
     *
     */
    setFreshData(state, {
      resource,
      freshData
    }) {
      resource._hydrate(freshData);
    }

  };
  let actions = {
    createResource(context, {
      resourceCollection,
      data
    }) {
      return axios.post(resourceCollection._uri, data).then(result => {
        context.commit('instantiateCollectionResource', {
          resourceCollection,
          data: result.data
        });
        return result.data.id;
      });
    },

    bulkCreateResource(context, {
      resourceCollection,
      data
    }) {
      return axios.post(resourceCollection._uri + '-bulk', data).then(result => {
        context.commit('instantiateCollectionResource', {
          resourceCollection,
          data: result.data
        });
      });
    },

    refreshResource(context, resource) {
      return axios.get(resource._uri).then(result => {
        context.commit('setFreshData', {
          resource,
          freshData: result.data
        });
      });
    },

    updateResource(context, {
      resource,
      data
    }) {
      return axios.patch(resource._uri, data).then(result => {
        // The API returns the entire object; filter down
        // to only the updated fields
        let resultData = _.pick(result.data, _.keys(data));

        context.commit('setResourceData', {
          resource,
          data: resultData
        });
      });
    },

    deleteResource(context, resource) {
      return axios.delete(resource._uri).then(() => {
        context.commit('removeResource', resource);
      });
    }

  };
  store.registerModule('autocrud', {
    state: () => state,
    mutations,
    getters,
    actions
  });
}

export { Resource, ResourceCollection, registerAutoCrudStoreModule };
