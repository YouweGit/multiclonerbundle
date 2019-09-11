pimcore.registerNS("pimcore.YouweGridCloner");

pimcore.YouweGridCloner = Class.create({

    getClassName: function () {
        return "pimcore.YouweGridCloner";
    },

    cloneForm: function (allowedClasses = ['']) {
        this.multiCloneWindowPanel = Ext.create('Ext.window.Window', {
            title: 'Create multiple clones of an object',
            modal:true,
            closeAction:'destroy',
            items: [this.createCloneForm(allowedClasses)]
        }).show();
    },

    createCloneForm: function (allowedClasses = ['']) {

        var keyGenerationMethodsStore = Ext.create('Ext.data.Store', {
            fields: ['value', 'text'],
            data : [{
                text: 'Add unique code',
                value: 'uniqueId'
            }, {
                text: 'Add counter',
                value: 'counter'
            }]
        });

        return this.multiCloneFormPanel = Ext.create('Ext.form.Panel',{
            url: '/admin/youwe_multi_cloner/cloneObject',
            width: 700,
            bodyPadding: 10,
            items: [
                this.getObjectSelector(allowedClasses),
                {
                    xtype: 'numberfield',
                    width: 480,
                    labelWidth: 300,
                    fieldLabel: 'Number of clones to create',
                    name: 'cloneCount',
                    allowBlank: false,
                    minValue: 1,
                    maxValue: 1000
                }
            ],
            buttons: [
                {
                    text: t('Create'),
                    iconCls: 'pimcore_icon_apply',
                    handler: function () {
                        var form = this.multiCloneFormPanel;
                        if (form.isValid()) {
                            this.multiCloneWindowPanel.hide();
                            pimcore.helpers.loadingShow();
                            form.submit({
                                success: function (form, action) {
                                    var response = Ext.decode(action.response.responseText);
                                    pimcore.helpers.loadingHide();
                                    pimcore.helpers.showNotification(t("Success"), t("Cloning succesful"), "success");
                                    this.multiCloneWindowPanel.destroy();
                                    // pimcore.elementservice.refreshNodeAllTrees("object", this.record.data.parentId);
                                    if(response.openFolder) {
                                        pimcore.helpers.openElement(response.parentFolderId, 'object');
                                    }
                                }.bind(this),
                                failure: function () {
                                    pimcore.helpers.loadingHide();
                                    pimcore.helpers.showNotification(t("Error"), t("Cloning UNsuccesful"), "error");
                                }.bind(this)
                            })
                        }
                    }.bind(this)
                }
            ]
        });
    },

    getHrefConfig: function(allowedClasses = ['']) {
        let allowedClassesConfig = [];
        for (let i in allowedClasses) {
            allowedClassesConfig[i] = {classes: allowedClasses[i]};
        }

        return {
            fieldtype: 'href',
            name: 'relatedObject',
            objectsAllowed: true,
            titleOriginal: 'Related object',
            title: 'Related object',
            labelWidth: 150,
            disabled: false,
            classes: allowedClassesConfig,
        };
    },

    getObjectSelector: function (allowedClasses = ['']) {
        var config = this.getHrefConfig(allowedClasses);
        var context = {};
        var data = {};
        var field = new pimcore.object.tags[config.fieldtype](data, config);

        field.updateContext(context);
        field.setTitle(config.titleOriginal);
        field.requestNicePathData = function() {
            // Empty function, needed because of overwriting default functionality
        };

        return field.getLayoutEdit();
    },

});

var YouweGridCloner = new pimcore.YouweGridCloner();

