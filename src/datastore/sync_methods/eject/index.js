var utils = require('utils'),
	errors = require('errors'),
	store = require('store'),
	services = require('services');

function _eject(resource, id) {
	if (id) {
		for (var i = 0; i < resource.collection.length; i++) {
			if (resource.collection[i][resource.idAttribute || 'id'] == id) {
				break;
			}
		}
		resource.collection.splice(i, 1);
		resource.observers[id].close();
		delete resource.observers[id];
		delete resource.index[id];
		delete resource.changes[id];
		delete resource.previous_attributes[id];
		delete resource.modified[id];
		delete resource.saved[id];
	} else {
		resource.collection = [];
		resource.index = {};
		resource.modified = {};
	}
	resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
}

/**
 * @doc method
 * @id DS.sync_methods:eject
 * @name eject
 * @description
 * `eject(resourceName[, id])`
 *
 * Eject the item of the specified type that has the given primary key from the data store. If no primary key is
 * provided, eject all items of the specified type from the data store. Ejection only removes items from the data store
 * and does not attempt to delete items on the server.
 *
 * Example:
 *
 * ```js
 * DS.get('document', 45); // { title: 'How to Cook', id: 45 }
 *
 * DS.eject('document', 45);
 *
 * DS.get('document', 45); // undefined
 * ```
 *
 * Eject all items of the specified type from the data store.
 *
 * ```js
 * DS.filter('document'); // [ { title: 'How to Cook', id: 45 }, { title: 'How to Eat', id: 46 } ]
 *
 * DS.eject('document');
 *
 * DS.filter('document'); // [ ]
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - If provided, argument `id` must be a string or a number.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to eject.
 */
function eject(resourceName, id) {
	if (!store[resourceName]) {
		throw new errors.RuntimeError('DS.eject(resourceName, id): ' + resourceName + ' is not a registered resource!');
	} else if (id && !utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError('DS.eject(resourceName, id): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } });
	}

	try {
		if (!services.$rootScope.$$phase) {
			services.$rootScope.$apply(function () {
				_eject(store[resourceName], id);
			});
		} else {
			_eject(store[resourceName], id);
		}
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = eject;
