import Resource from "./Resource";

let _relations
let _extensionClasses

export function registerResourceTypes(relations, extensionClasses = {}) {
    _relations = relations
    _extensionClasses = extensionClasses
}

export function getTypeRelations(type) {
    return _relations[type]
}

/**
 * Return the class type of instances of the given resource type,
 * which will be Resource or an optional subclass of Resource.
 *
 * @param type
 * @returns {Resource}
 */
export function getTypeResourceClass(type) {
    return _extensionClasses[type] ?? Resource
}