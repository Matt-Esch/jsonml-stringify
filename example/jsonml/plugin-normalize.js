var util = require("util")
var extend = require("xtend")

var isPluginFast = require("./is-plugin.js")
var getPlugin = require("./get-plugin.js")

module.exports = normalizeTree

function normalizeTree(tree, opts) {
	if (tree === null || tree === undefined) {
		return tree
	}

	if (isPluginFast(tree)) {
		return tree
	}

	if (!Array.isArray(tree)) {
		throw new Error("Invalid JSONML data structure " +
			util.inspect(tree) + " Non array is not a valid elem")
	}

	if (tree.length === 0) {
		throw new Error("Invalid JSONML data structure " +
			util.inspect(tree) + " Empty array is not a valid elem")
	}

	var selector = tree[0]
	var properties = tree[1] || {}
	var children = tree[2] || []

	if (isChildren(properties, opts)) {
		children = properties
		properties = {}
	}

	if (isPluginFast(children)) {
		children = [children]
	}

	if (typeof children === "string" && selector !== "#text") {
		children = [["#text", {}, children]]
	}

	var jsonml = [selector, properties, children]

	console.log("jsonml", typeof children, jsonml)

	if (opts.recur !== false && Array.isArray(children)) {
		jsonml[2] = children.map(function (child) {
			return normalize(child, extend(opts, {
				parent: jsonml,
				parents: opts.parents.concat([jsonml])
			}))
		})
	}

	if (typeof selector !== "string") {
		throw new Error("Invalid JSONML data structure " +
			util.inspect(jsonml) + " Selector is not a string")
	}

	if (!isObject(properties)) {
		throw new Error("Invalid JSONML data structure " +
			util.inspect(jsonml) + " Properties is not an object")
	}

	if (typeof selector === "#text" && typeof children !== "string") {
		throw new Error("Invalid JSONML data structure " +
			util.inspect(jsonml) + " Text node needs to contain text")
	}

	console.log("jsonml", require("util").inspect(jsonml, null, 10))

	return jsonml
}

function isChildren(maybeChildren, opts) {
	return Array.isArray(maybeChildren) ||
		typeof maybeChildren === "string" ||
		isValidPlugin(maybeChildren, opts)
}

function isObject(obj) {
	return typeof obj === "object" && obj !== null
}

function isValidPlugin(hash, plugins) {
	if (typeof hash === "function") {
		return true
	}

	if (Array.isArray(hash)) {
		return false
	}

	var pluginb = getPlugin(hash, opts)

	if (!isObject(hash)) {
		return false
	}

	var type = getType(hash)

	for (var i = 0; i < plugins.length; i++) {
		console.log("plugins", plugins)
		if (plugins[i].type === type) {
			return true
		}
	}

	return false
}
