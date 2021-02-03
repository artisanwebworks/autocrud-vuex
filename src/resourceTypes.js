
let _resourceTypes

export function registerResourceTypes(resourceTypes) {
    _resourceTypes = resourceTypes
}

export function getTypeRelations(type) {
    return _resourceTypes[type]
}
