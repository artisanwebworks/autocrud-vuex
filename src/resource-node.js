/**
 *
 * @param instance - a Resource or ResourceCollection.
 * @param type - string resource name which maps to a root property in 'resource-relation-tree.js'
 * @param id - resource id if this isn't a ResourceCollection
 * @param name - name used in formulation of HTTP route; omitted if id is defined
 * @param parent - a reference to parent Resource or ResourceCollection.
 * @param store
 */
export default (instance, {type, name, parent, store, extension}) => {

    instance._type = type
    instance._parent = parent
    instance._name = name
    instance._store = store
    instance._uri = deriveResourceUri(instance)

    if (extension) {
        Object.assign(instance, extension)
    }
}

function deriveResourceUri(instance) {

    let uriComponents = []

    for (let node = instance; node; node = node._parent) {

        // If a node is unnamed, it should be identified by id in the URI
        uriComponents.unshift(node._name ?? node.id)

        // The root node is represented in the URI by its type string
        if (!node._parent) {
            uriComponents.unshift(node._type)
        }
    }

    // Add URI prefix
    uriComponents.unshift('api')

    return location.origin + '/' + uriComponents.join('/').toLowerCase()
}