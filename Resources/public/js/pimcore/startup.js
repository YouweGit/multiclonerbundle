pimcore.registerNS("pimcore.plugin.YouweMultiClonerBundle");

pimcore.plugin.YouweMultiClonerBundle = Class.create(pimcore.plugin.admin, {

    getClassName: function () {
        return "pimcore.plugin.YouweMultiClonerBundle";
    },

    initialize: function () {
        pimcore.plugin.broker.registerPlugin(this);
    },

    pimcoreReady: function (params, broker) {

    },

    prepareObjectTreeContextMenu: function (menu, self, record) {
        YouweMultiCloner.attach(menu, record);
    },

});

var YouweMultiClonerBundlePlugin = new pimcore.plugin.YouweMultiClonerBundle();

